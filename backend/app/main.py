from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="StudySync AI & Ingestion Service",
    description="Dedicated Python backend for PDF ingestion, pgvector embeddings, and Gemini RAG generation.",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Internal security dependency
api_key_header = APIKeyHeader(name="X-Internal-Secret", auto_error=False)

def verify_internal_secret(api_key: str = Security(api_key_header)):
    if settings.ENVIRONMENT == "production" and api_key != settings.INTERNAL_API_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized internal request")
    return True

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "StudySync AI Service",
        "environment": settings.ENVIRONMENT,
    }

@app.get("/")
def root():
    return {"message": "StudySync AI & Ingestion Engine active."}
