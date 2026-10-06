from typing import List, Optional, Dict, Any
import psycopg
from psycopg.rows import dict_row
from pgvector.psycopg import register_vector
from app.config import get_settings
from app.services.chunker import ChunkData

settings = get_settings()

def get_db_connection():
    """Create a new PostgreSQL connection with pgvector registered."""
    conn = psycopg.connect(settings.DATABASE_URL, row_factory=dict_row)
    register_vector(conn)
    return conn

def get_document_for_ingestion(document_id: str) -> Optional[Dict[str, Any]]:
    """Fetch document details needed for processing."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, course_id, user_id, title, r2_key, status
                FROM documents
                WHERE id = %s
                """,
                (document_id,),
            )
            return cur.fetchone()

def mark_document_processing(document_id: str) -> None:
    """Transition document status to PROCESSING with started timestamp."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE documents
                SET status = 'PROCESSING',
                    processing_started_at = NOW(),
                    error_message = NULL,
                    updated_at = NOW()
                WHERE id = %s
                """,
                (document_id,),
            )
        conn.commit()

def persist_document_chunks_atomic(
    document_id: str,
    course_id: str,
    chunks: List[ChunkData],
    embeddings: List[List[float]],
    page_count: int,
) -> None:
    """
    Atomically inserts all document chunks and marks document READY.
    If anything fails, the entire transaction is rolled back.
    """
    if len(chunks) != len(embeddings):
        raise ValueError(
            f"Chunk count ({len(chunks)}) does not match embedding count ({len(embeddings)})"
        )

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # 1. Clean any pre-existing chunks for idempotency
            cur.execute(
                "DELETE FROM document_chunks WHERE document_id = %s",
                (document_id,),
            )

            # 2. Batch insert chunks with vector embeddings
            insert_query = """
                INSERT INTO document_chunks (
                    id,
                    document_id,
                    course_id,
                    chunk_index,
                    content,
                    page_start,
                    page_end,
                    char_start,
                    char_end,
                    embedding,
                    embedding_model,
                    created_at
                ) VALUES (
                    gen_random_uuid(),
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
                )
            """

            for chunk, emb in zip(chunks, embeddings):
                cur.execute(
                    insert_query,
                    (
                        document_id,
                        course_id,
                        chunk.chunk_index,
                        chunk.content,
                        chunk.page_start,
                        chunk.page_end,
                        chunk.char_start,
                        chunk.char_end,
                        emb,
                        settings.GEMINI_EMBEDDING_MODEL,
                    ),
                )

            # 3. Transition document to READY
            cur.execute(
                """
                UPDATE documents
                SET status = 'READY',
                    page_count = %s,
                    error_message = NULL,
                    updated_at = NOW()
                WHERE id = %s
                """,
                (page_count, document_id),
            )

        conn.commit()

def mark_document_failed(document_id: str, error_message: str) -> None:
    """
    Purges any partial chunks and marks document FAILED with user-facing error message.
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "DELETE FROM document_chunks WHERE document_id = %s",
                    (document_id,),
                )
                cur.execute(
                    """
                    UPDATE documents
                    SET status = 'FAILED',
                        error_message = %s,
                        updated_at = NOW()
                    WHERE id = %s
                    """,
                    (error_message, document_id),
                )
            conn.commit()
    except Exception as e:
        print(f"[mark_document_failed] Database error updating failure for {document_id}: {e}")
