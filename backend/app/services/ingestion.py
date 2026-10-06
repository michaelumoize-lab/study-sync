import time
from app.services.storage import download_pdf_bytes, delete_r2_object
from app.services.extractor import extract_pdf_pages, ScannedPDFException
from app.services.chunker import chunk_extracted_pages
from app.services.embeddings import generate_embeddings_for_chunks
from app.services.db import (
    get_document_for_ingestion,
    mark_document_processing,
    persist_document_chunks_atomic,
    mark_document_failed,
)

def run_document_ingestion(document_id: str) -> None:
    """
    Asynchronous background ingestion pipeline:
    1. Fetches document metadata.
    2. Transitions status to PROCESSING.
    3. Streams raw PDF from Cloudflare R2.
    4. Validates digital text structure (catches scanned PDFs).
    5. Performs strict page-bounded text chunking.
    6. Generates 768-dimensional embeddings via Google Gemini.
    7. Atomically saves chunks & vector embeddings into Neon pgvector.
    8. Updates document status to READY.
    On error: rolls back, marks FAILED, and purges raw R2 object.
    """
    print(f"[Ingestion] Starting ingestion for document {document_id}")
    start_time = time.time()

    doc = get_document_for_ingestion(document_id)
    if not doc:
        print(f"[Ingestion] Document {document_id} not found in database. Aborting.")
        return

    r2_key = doc["r2_key"]
    course_id = doc["course_id"]

    try:
        # Step 1: Mark PROCESSING
        mark_document_processing(document_id)

        # Step 2: Download raw PDF bytes from Cloudflare R2
        print(f"[Ingestion] Downloading from R2: {r2_key}")
        pdf_bytes = download_pdf_bytes(r2_key)

        # Step 3: Extract pages & validate digital text
        print(f"[Ingestion] Extracting text with layout parser...")
        pages = extract_pdf_pages(pdf_bytes)
        print(f"[Ingestion] Extracted {len(pages)} pages.")

        # Step 4: Chunk strictly bounded by page boundaries
        chunks = chunk_extracted_pages(pages)
        if not chunks:
            raise ScannedPDFException("No extractable text content found in document.")

        print(f"[Ingestion] Created {len(chunks)} page-bounded chunks.")

        # Step 5: Generate Gemini embeddings (768 dimensions)
        print(f"[Ingestion] Calling Gemini embedding API...")
        chunk_texts = [c.content for c in chunks]
        embeddings = generate_embeddings_for_chunks(chunk_texts)
        print(f"[Ingestion] Generated {len(embeddings)} embeddings.")

        # Step 6: Atomically persist to Neon pgvector
        print(f"[Ingestion] Persisting chunks into Neon...")
        persist_document_chunks_atomic(
            document_id=str(document_id),
            course_id=str(course_id),
            chunks=chunks,
            embeddings=embeddings,
            page_count=len(pages),
        )

        elapsed = time.time() - start_time
        print(f"[Ingestion] Document {document_id} successfully indexed in {elapsed:.2f}s! Status: READY.")

    except ScannedPDFException as spe:
        error_msg = str(spe)
        print(f"[Ingestion] Scanned PDF detected for {document_id}: {error_msg}")
        mark_document_failed(document_id, error_msg)
        delete_r2_object(r2_key)

    except Exception as e:
        error_msg = f"Ingestion error: {str(e)}"
        print(f"[Ingestion] Unexpected error processing {document_id}: {error_msg}")
        mark_document_failed(document_id, error_msg)
        delete_r2_object(r2_key)
