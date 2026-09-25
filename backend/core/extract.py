import pdfplumber
from typing import Tuple

SCANNED_DOC_MESSAGE = "This document appears to be a scanned image. Please upload a text-based PDF."

def extract_pdf_data(file_path: str) -> Tuple[str, int]:
    """
    Extract text and page count from a PDF file using pdfplumber.
    Returns:
        tuple (extracted_text, page_count):
            - extracted_text: all page text joined with double newlines,
              or warning message if no text was extracted (scanned image).
            - page_count: total number of pages in the PDF.
    """
    page_texts = []
    page_count = 0

    with pdfplumber.open(file_path) as pdf:
        page_count = len(pdf.pages)
        for page in pdf.pages:
            text = page.extract_text()
            if text and text.strip():
                page_texts.append(text.strip())

    full_text = "\n\n".join(page_texts).strip()

    if not full_text:
        return SCANNED_DOC_MESSAGE, page_count

    return full_text, page_count

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from a PDF file using pdfplumber, joining pages with double newlines.
    If no text is extracted (e.g. scanned image), returns:
    'This document appears to be a scanned image. Please upload a text-based PDF.'
    """
    text, _ = extract_pdf_data(file_path)
    return text
