from fastapi import APIRouter, BackgroundTasks, Depends, status
from app.main import verify_internal_secret
from app.services.ingestion import run_document_ingestion

router = APIRouter(prefix="/internal/documents", tags=["ingestion"])

@router.post(
    "/{document_id}/ingest",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(verify_internal_secret)],
)
async def trigger_document_ingestion(
    document_id: str,
    background_tasks: BackgroundTasks,
):
    """
    Internal endpoint called by Next.js when a client confirms raw PDF upload to R2.
    Spawns background extraction, chunking, and vector embedding.
    """
    background_tasks.add_task(run_document_ingestion, document_id)
    return {
        "status": "accepted",
        "document_id": document_id,
        "message": "Ingestion job queued successfully.",
    }
