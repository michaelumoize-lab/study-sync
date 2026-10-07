from typing import List, Dict, Any, Optional
from app.services.db import get_db_connection
from pgvector import Vector

def search_course_chunks(
    course_id: str,
    query_embedding: List[float],
    limit: int = 6,
    document_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Performs cosine distance search (<=>) in Neon pgvector.
    Strictly scopes to chunks belonging to the course and in READY status.
    Optionally scopes to a single document_id if the user applied a filter.
    Returns: list of dicts with chunk content, page boundaries, document title, document id, and similarity score.
    """
    vec = Vector(query_embedding)
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            if document_id:
                query = """
                    SELECT 
                        c.id as chunk_id,
                        c.document_id,
                        c.chunk_index,
                        c.content,
                        c.page_start,
                        c.page_end,
                        d.title as document_title,
                        1 - (c.embedding <=> %s) as similarity
                    FROM document_chunks c
                    JOIN documents d ON c.document_id = d.id
                    WHERE c.course_id = %s
                      AND c.document_id = %s
                      AND d.status = 'READY'
                    ORDER BY c.embedding <=> %s
                    LIMIT %s;
                """
                cur.execute(
                    query,
                    (vec, course_id, document_id, vec, limit),
                )
            else:
                query = """
                    SELECT 
                        c.id as chunk_id,
                        c.document_id,
                        c.chunk_index,
                        c.content,
                        c.page_start,
                        c.page_end,
                        d.title as document_title,
                        1 - (c.embedding <=> %s) as similarity
                    FROM document_chunks c
                    JOIN documents d ON c.document_id = d.id
                    WHERE c.course_id = %s
                      AND d.status = 'READY'
                    ORDER BY c.embedding <=> %s
                    LIMIT %s;
                """
                cur.execute(
                    query,
                    (vec, course_id, vec, limit),
                )

            rows = cur.fetchall()
            return [
                {
                    "chunk_id": str(r["chunk_id"]),
                    "document_id": str(r["document_id"]),
                    "chunk_index": r["chunk_index"],
                    "content": r["content"],
                    "page_start": r["page_start"],
                    "page_end": r["page_end"],
                    "document_title": r["document_title"],
                    "similarity": float(r["similarity"]),
                }
                for r in rows
            ]
