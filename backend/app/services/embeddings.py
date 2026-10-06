import time
from typing import List
from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import get_settings

settings = get_settings()

def get_genai_client():
    return genai.Client(api_key=settings.GEMINI_API_KEY)

@retry(
    stop=stop_after_attempt(4),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    reraise=True,
)
def embed_single_text(client: genai.Client, text: str) -> List[float]:
    """
    Embeds a single chunk of text with Google Gemini, enforcing 768 dimensions.
    Automatically retries with exponential backoff on transient errors.
    """
    response = client.models.embed_content(
        model=settings.GEMINI_EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(output_dimensionality=768),
    )
    vector = response.embeddings[0].values
    if len(vector) != 768:
        raise ValueError(f"Expected 768 dimensions from embedding model, got {len(vector)}")
    return vector

def generate_embeddings_for_chunks(chunk_texts: List[str]) -> List[List[float]]:
    """
    Generates 768-dimensional embeddings for a list of text chunks.
    Processes sequentially or in small paced batches to respect API limits.
    """
    if not chunk_texts:
        return []

    client = get_genai_client()
    embeddings: List[List[float]] = []

    for i, text in enumerate(chunk_texts):
        vector = embed_single_text(client, text)
        embeddings.append(vector)
        # Gentle pacing (20ms) between calls to prevent bursting quotas
        if i < len(chunk_texts) - 1:
            time.sleep(0.02)

    return embeddings
