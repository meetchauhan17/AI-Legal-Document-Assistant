import pdfplumber
from typing import List, Dict, Any
from pathlib import Path

class DocumentProcessor:
    """PDF document parsing with pdfplumber and text chunking for RAG pipeline."""

    @staticmethod
    def extract_text_from_pdf(file_path: Path | str) -> List[Dict[str, Any]]:
        """
        Extract text from PDF pages using pdfplumber.
        Returns a list of dicts with page number and extracted text.
        """
        pages_content = []
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text() or ""
                cleaned_text = text.strip()
                if cleaned_text:
                    pages_content.append({
                        "page_number": page_num,
                        "text": cleaned_text
                    })
        return pages_content

    @staticmethod
    def chunk_text(
        text: str,
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ) -> List[str]:
        """Simple, deterministic character/token chunking with overlap."""
        if not text:
            return []
        
        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk.strip())
            start += chunk_size - chunk_overlap
            if start >= text_length:
                break

        return [c for c in chunks if c]

    @classmethod
    def process_pdf_for_rag(
        cls,
        file_path: Path | str,
        document_id: str,
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ) -> Dict[str, Any]:
        """Parse PDF and generate chunks with metadata for vector DB ingestion."""
        pages = cls.extract_text_from_pdf(file_path)
        all_chunks = []
        all_metadatas = []
        all_ids = []

        chunk_counter = 0
        for page in pages:
            page_chunks = cls.chunk_text(
                page["text"],
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap
            )
            for chunk in page_chunks:
                chunk_id = f"{document_id}_p{page['page_number']}_c{chunk_counter}"
                all_chunks.append(chunk)
                all_metadatas.append({
                    "document_id": document_id,
                    "page_number": page["page_number"],
                    "chunk_index": chunk_counter
                })
                all_ids.append(chunk_id)
                chunk_counter += 1

        return {
            "document_id": document_id,
            "total_pages": len(pages),
            "chunks": all_chunks,
            "metadatas": all_metadatas,
            "ids": all_ids
        }
