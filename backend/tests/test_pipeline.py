import os
import io
import sys
from pathlib import Path

# Ensure root directory is on sys.path
_CURRENT_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _CURRENT_DIR.parent
_ROOT_DIR = str(_BACKEND_DIR.parent)
if _ROOT_DIR not in sys.path:
    sys.path.insert(0, _ROOT_DIR)

import requests
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from backend.core.extract import extract_text_from_pdf, extract_pdf_data, SCANNED_DOC_MESSAGE

UPLOADS_DIR = _BACKEND_DIR / "uploads"
SCRATCH_DIR = _BACKEND_DIR / "test_docs"
SCRATCH_DIR.mkdir(parents=True, exist_ok=True)

def generate_sample_legal_pdf(file_path: Path):
    """Generate a multi-page legal agreement PDF."""
    c = canvas.Canvas(str(file_path), pagesize=letter)
    
    # Page 1: Non-Disclosure Agreement
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, 720, "MUTUAL NON-DISCLOSURE AGREEMENT")
    c.setFont("Helvetica", 11)
    c.drawString(72, 690, "This Mutual Non-Disclosure Agreement ('Agreement') is entered into as of January 15, 2026.")
    c.drawString(72, 670, "BETWEEN: Party A Corporation, having its principal office at 100 Legal Way, Suite 400,")
    c.drawString(72, 650, "AND: Party B Enterprises, having its principal office at 200 Innovation Blvd.")
    c.drawString(72, 620, "1. Confidential Information: All proprietary, technical, and commercial data disclosed hereunder.")
    c.drawString(72, 600, "2. Obligations: The receiving party shall hold in strict confidence and not disclose to third parties.")
    c.showPage()
    
    # Page 2: Term and Termination
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, 720, "3. TERM AND TERMINATION")
    c.setFont("Helvetica", 11)
    c.drawString(72, 690, "This Agreement shall remain in effect for three (3) years from the Effective Date.")
    c.drawString(72, 670, "4. Governing Law: This Agreement shall be governed by the laws of the State of Delaware.")
    c.drawString(72, 640, "IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.")
    c.showPage()
    
    c.save()

def generate_blank_scanned_pdf(file_path: Path):
    """Generate a PDF with no text elements to simulate a scanned image."""
    c = canvas.Canvas(str(file_path), pagesize=letter)
    # Draw a rectangle without any text strings
    c.rect(50, 50, 500, 700, stroke=1, fill=0)
    c.showPage()
    c.save()

def run_tests():
    print("=== 1. Testing Core Extraction Logic directly ===")
    legal_pdf_path = SCRATCH_DIR / "sample_contract.pdf"
    scanned_pdf_path = SCRATCH_DIR / "scanned_doc.pdf"
    
    generate_sample_legal_pdf(legal_pdf_path)
    generate_blank_scanned_pdf(scanned_pdf_path)
    
    # Test extract_text_from_pdf on legal PDF
    extracted_text = extract_text_from_pdf(str(legal_pdf_path))
    assert "MUTUAL NON-DISCLOSURE AGREEMENT" in extracted_text, "Failed to extract title from Page 1"
    assert "Delaware" in extracted_text, "Failed to extract governing law from Page 2"
    assert "\n\n" in extracted_text, "Pages were not joined by double newlines"
    print("  [PASS] extract_text_from_pdf successfully extracted multi-page legal agreement with double newlines.")
    
    # Test scanned image fallback
    scanned_result = extract_text_from_pdf(str(scanned_pdf_path))
    assert scanned_result == SCANNED_DOC_MESSAGE, f"Unexpected message: {scanned_result}"
    print(f"  [PASS] Scanned PDF fallback verified: '{scanned_result}'")

    print("\n=== 2. Testing FastAPI POST /api/upload endpoint ===")
    url_upload = "http://127.0.0.1:8000/api/upload"
    
    with open(legal_pdf_path, "rb") as f:
        files = {"file": ("sample_contract.pdf", f, "application/pdf")}
        res = requests.post(url_upload, files=files)
    
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "document_id" in data, "Missing document_id"
    assert "text_preview" in data, "Missing text_preview"
    assert "full_text" in data, "Missing full_text"
    assert "page_count" in data, "Missing page_count"
    assert data["page_count"] == 2, f"Expected 2 pages, got {data['page_count']}"
    assert len(data["text_preview"]) <= 500, "text_preview exceeds 500 characters"
    assert "MUTUAL NON-DISCLOSURE AGREEMENT" in data["full_text"], "Missing contract content"
    print("  [PASS] /api/upload response schema and content valid:")
    print(f"         document_id: {data['document_id']}")
    print(f"         page_count: {data['page_count']}")
    print(f"         text_preview (first 100 chars): {data['text_preview'][:100]}...")

    # Check temp file cleanup
    # Only .gitkeep should remain in /backend/uploads
    uploads_files = [f.name for f in UPLOADS_DIR.iterdir() if f.name != ".gitkeep"]
    assert len(uploads_files) == 0, f"Temp files not deleted! Found: {uploads_files}"
    print("  [PASS] /backend/uploads/ is clean! All temporary files immediately deleted.")

    print("\n=== 3. Testing Input Validation & Rejections ===")
    # Rejection of non-PDF
    dummy_txt = io.BytesIO(b"Just plain text file content")
    files_invalid = {"file": ("document.txt", dummy_txt, "text/plain")}
    res_invalid = requests.post(url_upload, files=files_invalid)
    assert res_invalid.status_code == 400, f"Expected 400 for non-pdf, got {res_invalid.status_code}"
    print(f"  [PASS] Non-PDF rejected with 400: {res_invalid.json().get('detail')}")

    # Rejection of files > 5MB
    large_pdf_bytes = io.BytesIO(b"%PDF-1.4 " + (b"0" * (5 * 1024 * 1024 + 100)))
    files_large = {"file": ("oversized.pdf", large_pdf_bytes, "application/pdf")}
    res_large = requests.post(url_upload, files=files_large)
    assert res_large.status_code in [400, 413], f"Expected 400/413 for oversized file, got {res_large.status_code}"
    print(f"  [PASS] Oversized file (>5MB) rejected with {res_large.status_code}: {res_large.json().get('detail')}")
    
    # Confirm temp file still cleaned up even on size reject
    uploads_files_after_reject = [f.name for f in UPLOADS_DIR.iterdir() if f.name != ".gitkeep"]
    assert len(uploads_files_after_reject) == 0, f"Temp file leaked on rejection! Found: {uploads_files_after_reject}"
    print("  [PASS] Temp file cleanup verified even on oversized reject.")

    print("\n=== 4. Testing POST /api/upload-text (Pasted Text) ===")
    url_text = "http://127.0.0.1:8000/api/upload-text"
    sample_text = (
        "SECTION 14. INDEMNIFICATION.\n"
        "Each party shall defend, indemnify and hold harmless the other party from and against "
        "any claims, liabilities, losses, damages, and reasonable attorney fees arising out of "
        "any material breach of representation or warranty."
    )
    res_text = requests.post(url_text, json={"text": sample_text})
    assert res_text.status_code == 200, f"Expected 200, got {res_text.status_code}: {res_text.text}"
    data_text = res_text.json()
    assert "document_id" in data_text
    assert "text_preview" in data_text
    assert "full_text" in data_text
    assert data_text["page_count"] == 1
    assert "INDEMNIFICATION" in data_text["full_text"]
    print("  [PASS] /api/upload-text response schema and content valid:")
    print(f"         document_id: {data_text['document_id']}")
    print(f"         page_count: {data_text['page_count']}")
    print(f"         full_text excerpt: {data_text['text_preview'][:80]}...")

    # Empty text rejection
    res_empty = requests.post(url_text, json={"text": "   "})
    assert res_empty.status_code == 400, f"Expected 400 for empty text, got {res_empty.status_code}"
    print(f"  [PASS] Empty text rejected with 400: {res_empty.json().get('detail')}")

    # Cleanup scratch test files
    for p in SCRATCH_DIR.iterdir():
        p.unlink()
    SCRATCH_DIR.rmdir()

    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    run_tests()
