import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import get_settings
from app.services.storage import get_s3_client
from app.services.embeddings import get_genai_client, embed_single_text
from app.services.db import get_db_connection

def test_pipeline_components():
    print("=== Testing StudySync Pipeline Services ===")
    settings = get_settings()

    # 1. Test Cloudflare R2 Connection
    print("\n1. Testing Cloudflare R2 Bucket Connection...")
    try:
        s3 = get_s3_client()
        response = s3.list_objects_v2(Bucket=settings.R2_BUCKET_NAME, MaxKeys=5)
        print(f"   [SUCCESS] R2 Bucket '{settings.R2_BUCKET_NAME}' reachable.")
        keys = [obj['Key'] for obj in response.get('Contents', [])]
        print(f"   Existing keys sample: {keys[:3]}")
    except Exception as e:
        print(f"   [FAILED] R2 error: {e}")

    # 2. Test Gemini API Embedding
    print("\n2. Testing Gemini API (Model: gemini-embedding-2, 768 dimensions)...")
    try:
        client = get_genai_client()
        sample_text = "StudySync is an AI-powered course companion that indexes student PDFs with vector search."
        vector = embed_single_text(client, sample_text)
        print(f"   [SUCCESS] Embedding generated! Dimensions: {len(vector)}")
        assert len(vector) == 768, f"Expected 768 dimensions, got {len(vector)}"
    except Exception as e:
        print(f"   [FAILED] Gemini API error: {e}")

    # 3. Test Neon DB & pgvector
    print("\n3. Testing Neon DB & pgvector connection...")
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT extversion FROM pg_extension WHERE extname = 'vector';")
                row = cur.fetchone()
                print(f"   [SUCCESS] Neon DB connected! pgvector version: {row['extversion'] if row else 'Not found'}")
                
                cur.execute("SELECT COUNT(*) as count FROM documents;")
                doc_count = cur.fetchone()['count']
                cur.execute("SELECT COUNT(*) as count FROM document_chunks;")
                chunk_count = cur.fetchone()['count']
                print(f"   Database stats: {doc_count} documents, {chunk_count} document chunks.")
    except Exception as e:
        print(f"   [FAILED] DB error: {e}")

    print("\n=== Pipeline Check Completed ===")

if __name__ == "__main__":
    test_pipeline_components()
