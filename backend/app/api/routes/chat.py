from typing import List, Dict, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.main import verify_internal_secret
from app.services.chat import stream_course_chat

router = APIRouter(prefix="/internal/courses", tags=["chat"])

class ChatStreamRequest(BaseModel):
    thread_id: str
    user_prompt: str
    history: List[Dict[str, str]] = []
    document_id: Optional[str] = None
    course_title: Optional[str] = "your course"

@router.post(
    "/{course_id}/chat/stream",
    dependencies=[Depends(verify_internal_secret)],
)
async def chat_stream_endpoint(
    course_id: str,
    payload: ChatStreamRequest,
):
    """
    Internal streaming endpoint called by Next.js SSE proxy.
    Emits SSE events: status, token, citations, done, error.
    """
    generator = stream_course_chat(
        course_id=course_id,
        thread_id=payload.thread_id,
        user_prompt=payload.user_prompt,
        history=payload.history,
        document_id=payload.document_id,
        course_title=payload.course_title,
    )

    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
