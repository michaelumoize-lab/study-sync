from typing import List, NamedTuple
from app.services.extractor import ExtractedPage

class ChunkData(NamedTuple):
    chunk_index: int
    content: str
    page_start: int
    page_end: int
    char_start: int
    char_end: int

# Target chunk sizing: ~500 to 700 tokens (approx 2000-2800 characters)
TARGET_CHUNK_CHARS = 2400
CHUNK_OVERLAP_CHARS = 200

def chunk_page_text(
    page_number: int,
    text: str,
    start_chunk_index: int
) -> List[ChunkData]:
    """
    Chunks a single page's text strictly within the page boundary.
    If the page is under TARGET_CHUNK_CHARS, returns a single chunk for that page.
    If larger, splits by paragraph/sentence with CHUNK_OVERLAP_CHARS overlap.
    """
    if not text:
        return []

    text_len = len(text)
    
    # Short page (typical lecture slide): keep as single isolated chunk
    if text_len <= TARGET_CHUNK_CHARS:
        return [
            ChunkData(
                chunk_index=start_chunk_index,
                content=text,
                page_start=page_number,
                page_end=page_number,
                char_start=0,
                char_end=text_len,
            )
        ]

    # Longer page: split into overlapping chunks within this page
    chunks: List[ChunkData] = []
    start = 0
    current_index = start_chunk_index

    while start < text_len:
        end = min(start + TARGET_CHUNK_CHARS, text_len)

        # If not at the end of text, try to break at a newline or period
        if end < text_len:
            boundary = text.rfind("\n\n", start + TARGET_CHUNK_CHARS // 2, end)
            if boundary == -1:
                boundary = text.rfind(". ", start + TARGET_CHUNK_CHARS // 2, end)
            if boundary == -1:
                boundary = text.rfind("\n", start + TARGET_CHUNK_CHARS // 2, end)
            if boundary == -1:
                boundary = text.rfind(" ", start + TARGET_CHUNK_CHARS // 2, end)

            if boundary != -1:
                end = boundary + 1

        chunk_text = text[start:end].strip()
        if chunk_text:
            chunks.append(
                ChunkData(
                    chunk_index=current_index,
                    content=chunk_text,
                    page_start=page_number,
                    page_end=page_number,
                    char_start=start,
                    char_end=end,
                )
            )
            current_index += 1

        if end >= text_len:
            break

        start = max(start + 1, end - CHUNK_OVERLAP_CHARS)

    return chunks

def chunk_extracted_pages(pages: List[ExtractedPage]) -> List[ChunkData]:
    """
    Takes all extracted pages and produces a unified list of strictly page-bounded chunks.
    """
    all_chunks: List[ChunkData] = []
    chunk_counter = 0

    for page in pages:
        if not page.text:
            continue
        page_chunks = chunk_page_text(page.page_number, page.text, chunk_counter)
        all_chunks.extend(page_chunks)
        chunk_counter += len(page_chunks)

    return all_chunks
