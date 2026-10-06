import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.extractor import extract_pdf_pages, ScannedPDFException
from app.services.chunker import chunk_extracted_pages
from app.services.embeddings import generate_embeddings_for_chunks

SAMPLE_VALID_PDF = b"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 135 >> stream
BT
/F1 14 Tf
72 700 Td
(StudySync is an AI-powered course companion designed to transform academic lecture slides and course readings into an interactive study workspace.) Tj
ET
endstream endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000227 00000 n 
0000000305 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
492
%%EOF
"""

SAMPLE_EMPTY_PDF = b"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >> endobj
4 0 obj << /Length 0 >> stream
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000201 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
252
%%EOF
"""

def test_extraction_and_chunking():
    print("=== Testing Extractor & Chunker Pipeline ===")

    # Test 1: Valid PDF with digital text
    print("\n1. Testing Valid PDF Extraction...")
    try:
        pages = extract_pdf_pages(SAMPLE_VALID_PDF)
        print(f"   [SUCCESS] Extracted {len(pages)} page(s).")
        print(f"   Page 1 text preview: '{pages[0].text[:80]}...' (char count: {pages[0].char_count})")

        chunks = chunk_extracted_pages(pages)
        print(f"   [SUCCESS] Chunked into {len(chunks)} chunk(s).")
        print(f"   Chunk 0 content: '{chunks[0].content[:80]}...' (page: {chunks[0].page_start})")

        print("   Calling Gemini embedding on chunk...")
        embs = generate_embeddings_for_chunks([c.content for c in chunks])
        print(f"   [SUCCESS] Generated {len(embs)} embedding(s), dimensions={len(embs[0])}")
        assert len(embs[0]) == 768
    except Exception as e:
        print(f"   [FAILED] Error: {e}")
        raise

    # Test 2: Scanned/Empty PDF Detection
    print("\n2. Testing Empty / Scanned PDF Failure Detection...")
    try:
        extract_pdf_pages(SAMPLE_EMPTY_PDF)
        print("   [FAILED] Expected ScannedPDFException but extraction succeeded.")
    except ScannedPDFException as e:
        print(f"   [SUCCESS] Correctly detected scanned/empty PDF: '{e}'")
    except Exception as e:
        print(f"   [FAILED] Unexpected exception type: {type(e)} - {e}")

    print("\n=== All Extraction & Embedding Tests Passed! ===")

if __name__ == "__main__":
    test_extraction_and_chunking()
