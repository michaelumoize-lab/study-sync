import io
import re
from typing import List, NamedTuple
import pdfplumber
import pypdf

class ScannedPDFException(Exception):
    """Raised when an uploaded PDF does not contain extractable digital text."""
    pass

class ExtractedPage(NamedTuple):
    page_number: int
    text: str
    char_count: int

def clean_extracted_text(text: str) -> str:
    """Clean unprintable characters and normalize whitespace."""
    if not text:
        return ""
    # Strip null bytes and non-printable control characters (except newline, tab)
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    # Normalize multiple whitespace within lines
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    # Normalize excessive newlines
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()

def extract_pdf_pages(pdf_bytes: bytes) -> List[ExtractedPage]:
    """
    Extracts text page by page using pdfplumber with a pypdf fallback.
    Enforces minimum digital text requirement (> 100 characters total).
    """
    pages: List[ExtractedPage] = []
    total_chars = 0

    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for idx, page in enumerate(pdf.pages, start=1):
                raw_text = page.extract_text() or ""
                cleaned = clean_extracted_text(raw_text)
                char_count = len(cleaned)
                total_chars += char_count
                pages.append(
                    ExtractedPage(
                        page_number=idx,
                        text=cleaned,
                        char_count=char_count,
                    )
                )
    except Exception as e:
        # Fallback to pypdf if pdfplumber encounters an error
        pages = []
        total_chars = 0
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        for idx, page in enumerate(reader.pages, start=1):
            raw_text = page.extract_text() or ""
            cleaned = clean_extracted_text(raw_text)
            char_count = len(cleaned)
            total_chars += char_count
            pages.append(
                ExtractedPage(
                    page_number=idx,
                    text=cleaned,
                    char_count=char_count,
                )
            )

    # Scanned PDF validation
    if total_chars < 100:
        raise ScannedPDFException(
            "This PDF contains no digital text. Scanned images and handwritten notes are not supported yet."
        )

    return pages
