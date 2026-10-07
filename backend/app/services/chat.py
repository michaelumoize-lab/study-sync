import json
import asyncio
from typing import AsyncGenerator, List, Dict, Any, Optional
from google import genai
from google.genai import types
from app.config import get_settings
from app.services.embeddings import embed_single_text, get_genai_client
from app.services.retrieval import search_course_chunks
from app.services.db import get_db_connection

settings = get_settings()

GROUNDED_SIMILARITY_THRESHOLD = 0.52

def save_chat_message(
    thread_id: str,
    role: str,
    content: str,
    status: str = "complete",
    model: Optional[str] = None,
    citations: Optional[List[Dict[str, Any]]] = None,
) -> str:
    """Inserts a chat message and returns its generated UUID."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO chat_messages (id, thread_id, role, content, status, model, citations, created_at)
                VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id;
                """,
                (
                    thread_id,
                    role,
                    content,
                    status,
                    model,
                    json.dumps(citations) if citations else None,
                ),
            )
            msg_id = str(cur.fetchone()["id"])
            # Update thread's updated_at
            cur.execute(
                "UPDATE chat_threads SET updated_at = NOW() WHERE id = %s;",
                (thread_id,),
            )
        conn.commit()
    return msg_id

def update_assistant_message(
    message_id: str,
    content: str,
    status: str = "complete",
    model: Optional[str] = None,
    citations: Optional[List[Dict[str, Any]]] = None,
) -> None:
    """Updates an existing assistant message when finished or cancelled."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE chat_messages
                SET content = %s,
                    status = %s,
                    model = %s,
                    citations = %s
                WHERE id = %s;
                """,
                (
                    content,
                    status,
                    model,
                    json.dumps(citations) if citations else None,
                    message_id,
                ),
            )
        conn.commit()

def count_messages_in_thread(thread_id: str) -> int:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT COUNT(*) as cnt FROM chat_messages WHERE thread_id = %s;",
                (thread_id,),
            )
            return cur.fetchone()["cnt"]

def generate_thread_title_task(thread_id: str, user_prompt: str, assistant_response: str) -> None:
    """Fast background title summarization after turn 1."""
    try:
        client = get_genai_client()
        prompt = (
            f"Generate a clear, descriptive 3 to 5 word topic title (no quotes, no preamble) "
            f"for a study chat thread that begins with:\n"
            f"Student: {user_prompt[:200]}\n"
            f"Tutor: {assistant_response[:300]}"
        )
        resp = client.models.generate_content(
            model=settings.GEMINI_FALLBACK_MODEL,
            contents=prompt,
        )
        title = resp.text.strip().strip('"\'*#')
        if title:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE chat_threads SET title = %s, updated_at = NOW() WHERE id = %s;",
                        (title[:80], thread_id),
                    )
                conn.commit()
            print(f"[Chat] Updated thread {thread_id} title to: '{title}'")
    except Exception as e:
        print(f"[Chat] Failed to auto-generate thread title for {thread_id}: {e}")

async def stream_course_chat(
    course_id: str,
    thread_id: str,
    user_prompt: str,
    history: List[Dict[str, str]],
    document_id: Optional[str] = None,
    course_title: Optional[str] = "your course",
) -> AsyncGenerator[str, None]:
    """
    Orchestrates the full RAG chat pipeline:
    1. Emits status event
    2. Saves user prompt immediately
    3. Embeds query & retrieves top chunks
    4. Constructs sliding window prompt
    5. Streams Gemini response with fallback
    6. Saves assistant response (or partial response on cancel)
    7. Schedules title generation on turn 1
    """
    client = get_genai_client()
    assistant_msg_id: Optional[str] = None
    accumulated_text = ""
    citations_payload: List[Dict[str, Any]] = []
    chosen_model = settings.GEMINI_MODEL

    try:
        # Step 1: Save user message immediately
        yield f"event: status\ndata: {json.dumps({'stage': 'searching'})}\n\n"
        save_chat_message(thread_id=thread_id, role="user", content=user_prompt)

        # Step 2: Query Embedding & Vector Retrieval
        # To improve follow-ups, combine with recent user message if short
        recent_user_context = ""
        for h in reversed(history[-2:]):
            if h.get("role") == "user":
                recent_user_context = h.get("content", "")[:120]
                break
        
        embed_input = f"{recent_user_context} {user_prompt}".strip() if recent_user_context else user_prompt
        query_vector = embed_single_text(client, embed_input)
        chunks = search_course_chunks(
            course_id=course_id,
            query_embedding=query_vector,
            limit=6,
            document_id=document_id,
        )

        max_similarity = max((c["similarity"] for c in chunks), default=0.0)
        is_grounded = max_similarity >= GROUNDED_SIMILARITY_THRESHOLD and len(chunks) > 0

        # Step 3: Build Citations Payload & Context Text
        context_blocks = []
        if is_grounded:
            for idx, c in enumerate(chunks, start=1):
                citation_obj = {
                    "index": idx,
                    "documentId": c["document_id"],
                    "documentTitle": c["document_title"],
                    "pageNumber": c["page_start"],
                    "excerpt": c["content"][:240],
                    "isDetached": False,
                }
                citations_payload.append(citation_obj)
                context_blocks.append(
                    f"[{idx}] Source: {c['document_title']} (Page/Slide {c['page_start']}):\n{c['content']}"
                )

        context_string = "\n\n".join(context_blocks)

        # Step 4: System Prompt Construction
        if is_grounded:
            system_instruction = (
                f"You are StudySync AI Tutor, a master academic companion for '{course_title}'.\n"
                f"Your mission is to provide rigorous, clear, and encouraging study explanations.\n"
                f"RULES:\n"
                f"1. Ground your answer primarily in the provided course excerpts.\n"
                f"2. When stating facts or definitions derived from the excerpts, cite them in brackets with their index number like [1], [2].\n"
                f"3. Use formatted Markdown: bold key terms, use code blocks with language tags for code, and standard LaTeX math (e.g. $O(n)$ or $$\\frac{{a}}{{b}}$$) for equations.\n"
                f"4. If the materials explain a concept, structure your explanation with bullet points and clear examples.\n\n"
                f"--- COURSE EXCERPTS ---\n{context_string}\n--- END EXCERPTS ---"
            )
        else:
            system_instruction = (
                f"You are StudySync AI Tutor for '{course_title}'.\n"
                f"IMPORTANT NOTICE:\n"
                f"The student's question is not directly covered in their uploaded lecture materials or syllabus documents.\n"
                f"RULES:\n"
                f"1. Open your response with a brief, polite disclaimer: '*(Note: This concept is not covered in your uploaded {course_title} materials, but academically speaking:)*'.\n"
                f"2. Provide a rigorous, helpful explanation based on universal academic and scientific principles.\n"
                f"3. Do NOT cite any document numbers [1], [2].\n"
                f"4. Use formatted Markdown with code blocks and LaTeX math where helpful."
            )

        # Step 5: Build Conversation Contents with Sliding Window
        contents = []
        # Prepend system instruction
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=f"[System Instruction]\n{system_instruction}")]))
        contents.append(types.Content(role="model", parts=[types.Part.from_text(text="Understood. I am ready to act as the StudySync Course AI Tutor following all formatting and citation rules.")]))

        # Sliding window of last 6 messages
        window = history[-6:] if len(history) > 6 else history
        for item in window:
            role = "user" if item.get("role") == "user" else "model"
            text_val = item.get("content", "").strip()
            if text_val:
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=text_val)]))

        # Current question
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_prompt)]))

        # Create placeholder assistant message record
        assistant_msg_id = save_chat_message(
            thread_id=thread_id,
            role="assistant",
            content="",
            status="complete",
            model=chosen_model,
            citations=citations_payload if is_grounded else None,
        )

        # Step 6: Stream from Gemini with Fallback
        stream_response = None
        try:
            stream_response = client.models.generate_content_stream(
                model=chosen_model,
                contents=contents,
            )
        except Exception as primary_err:
            print(f"[Chat] Primary model {chosen_model} failed ({primary_err}). Falling back to {settings.GEMINI_FALLBACK_MODEL}...")
            chosen_model = settings.GEMINI_FALLBACK_MODEL
            stream_response = client.models.generate_content_stream(
                model=chosen_model,
                contents=contents,
            )

        # Emit citations metadata before tokens or concurrently
        if citations_payload:
            yield f"event: citations\ndata: {json.dumps({'citations': citations_payload})}\n\n"

        # Stream tokens
        for chunk in stream_response:
            chunk_text = chunk.text or ""
            if chunk_text:
                accumulated_text += chunk_text
                yield f"event: token\ndata: {json.dumps({'text': chunk_text})}\n\n"
                await asyncio.sleep(0.005)

        # Step 7: Finalize Assistant Message
        update_assistant_message(
            message_id=assistant_msg_id,
            content=accumulated_text,
            status="complete",
            model=chosen_model,
            citations=citations_payload if is_grounded else None,
        )

        yield f"event: done\ndata: {json.dumps({'messageId': assistant_msg_id, 'model': chosen_model})}\n\n"

        # Step 8: Check if Turn 1 and auto-name thread
        msg_count = count_messages_in_thread(thread_id)
        if msg_count <= 2:
            asyncio.create_task(
                asyncio.to_thread(
                    generate_thread_title_task,
                    thread_id,
                    user_prompt,
                    accumulated_text,
                )
            )

    except asyncio.CancelledError:
        print(f"[Chat] Client disconnected/cancelled. Saving partial response for {assistant_msg_id} ({len(accumulated_text)} chars)...")
        if assistant_msg_id:
            update_assistant_message(
                message_id=assistant_msg_id,
                content=accumulated_text,
                status="stopped",
                model=chosen_model,
                citations=citations_payload if citations_payload else None,
            )
        raise

    except Exception as err:
        print(f"[Chat] Stream error: {err}")
        if assistant_msg_id:
            update_assistant_message(
                message_id=assistant_msg_id,
                content=accumulated_text or f"An error occurred: {str(err)}",
                status="error",
                model=chosen_model,
            )
        yield f"event: error\ndata: {json.dumps({'error': str(err)})}\n\n"
