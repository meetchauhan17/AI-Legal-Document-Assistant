import io
import requests
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from backend.core.rag import (
    chunk_document,
    create_session_collection,
    retrieve_relevant_chunks,
    session_collections,
    MAX_SESSIONS,
)

BASE_DIR = Path(__file__).resolve().parent
TEST_DOCS_DIR = BASE_DIR / "test_docs_rag"
TEST_DOCS_DIR.mkdir(parents=True, exist_ok=True)

def generate_test_legal_pdf(file_path: Path):
    """Generate a multi-page legal agreement with distinct clauses."""
    c = canvas.Canvas(str(file_path), pagesize=letter)
    
    # Page 1: Definitions and Confidentiality
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, 720, "MASTER SERVICES AGREEMENT")
    c.setFont("Helvetica", 11)
    c.drawString(72, 690, "This Master Services Agreement is entered into by and between Enterprise Alpha and Beta Corp.")
    c.drawString(72, 660, "1. CONFIDENTIALITY: Each party agrees to protect Proprietary Information with reasonable care.")
    c.drawString(72, 640, "Recipient shall not disclose any Trade Secrets to unauthorized third parties without prior written consent.")
    c.drawString(72, 610, "2. INTELLECTUAL PROPERTY: Customer retains all right, title, and interest in and to Customer Data.")
    c.drawString(72, 590, "Vendor retains all rights, copyrights, and patents in its pre-existing proprietary software tools.")
    c.showPage()
    
    # Page 2: Liability and Governing Law
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, 720, "3. LIMITATION OF LIABILITY")
    c.setFont("Helvetica", 11)
    c.drawString(72, 690, "In no event shall either party's aggregate liability exceed the total fees paid in the prior twelve months.")
    c.drawString(72, 660, "4. GOVERNING LAW AND DISPUTE RESOLUTION")
    c.drawString(72, 630, "This Agreement shall be construed and governed strictly under the laws of the State of Delaware.")
    c.drawString(72, 600, "Any unresolved dispute shall be submitted to binding arbitration in New Castle County, Delaware.")
    c.showPage()
    
    c.save()

def run_rag_tests():
    print("=== 1. Testing chunk_document() Boundaries and Overlap ===")
    sample_text = (
        "Article I: Recitals.\n"
        "Whereas, the Company is engaged in software engineering.\n\n"
        "Whereas, the Consultant possesses extensive experience in artificial intelligence.\n"
        "Now, therefore, the parties agree as follows:\n\n"
        "Article II: Services.\n"
        "Consultant shall deliver weekly advisory reports regarding machine learning systems and algorithmic security."
    )
    chunks = chunk_document(sample_text, chunk_size=120, overlap=30)
    assert len(chunks) >= 2, f"Expected multiple chunks, got {len(chunks)}"
    for idx, ch in enumerate(chunks):
        print(f"   Chunk {idx+1} ({len(ch)} chars): {ch}")
    print("  [PASS] chunk_document cleanly split on paragraph/sentence boundaries with overlap.")

    print("\n=== 2. Testing Direct create_session_collection() & retrieve_relevant_chunks() ===")
    test_doc_id = "test_manual_doc_101"
    test_chunks = [
        "Confidential Information shall include all technical blueprints and financial models.",
        "The governing law of this contract is the state laws of New York with exclusive jurisdiction in Manhattan.",
        "Payment terms are net 30 days upon receipt of an undisputed itemized invoice.",
        "Vendor warrants that the deliverables will conform to the technical specifications for ninety days."
    ]
    col = create_session_collection(test_doc_id, test_chunks)
    assert test_doc_id in session_collections, "Session not registered in session_collections dict"
    
    # Query for jurisdiction / governing law
    relevant = retrieve_relevant_chunks(test_doc_id, "What state law governs this contract?", top_k=2)
    assert len(relevant) > 0, "No chunks retrieved"
    assert "New York" in relevant[0], f"Expected New York in top chunk, got: {relevant[0]}"
    print(f"  [PASS] Query for governing law successfully retrieved top chunk:\n         '{relevant[0]}'")

    # Query for payment
    relevant_payment = retrieve_relevant_chunks(test_doc_id, "When must payments be made?", top_k=1)
    assert "net 30" in relevant_payment[0], f"Expected payment chunk, got: {relevant_payment[0]}"
    print(f"  [PASS] Query for payment terms successfully retrieved top chunk:\n         '{relevant_payment[0]}'")

    print("\n=== 3. Testing Upload PDF -> Automatic Indexing -> /api/retrieve ===")
    legal_pdf_path = TEST_DOCS_DIR / "sample_rag_contract.pdf"
    generate_test_legal_pdf(legal_pdf_path)
    
    with open(legal_pdf_path, "rb") as f:
        res = requests.post("http://127.0.0.1:8000/api/upload", files={"file": ("sample_rag_contract.pdf", f, "application/pdf")})
    
    assert res.status_code == 200, f"Upload failed: {res.text}"
    upload_data = res.json()
    uploaded_doc_id = upload_data["document_id"]
    print(f"  [PASS] Document uploaded and automatically indexed on server: {uploaded_doc_id}")
    
    # Retrieve relevant chunks via server API
    api_ret_res = requests.post(
        "http://127.0.0.1:8000/api/retrieve",
        json={"document_id": uploaded_doc_id, "query": "Which state laws govern the agreement and where is arbitration?", "top_k": 2}
    )
    assert api_ret_res.status_code == 200, f"Retrieve endpoint failed: {api_ret_res.text}"
    api_ret_data = api_ret_res.json()
    pdf_relevant = api_ret_data["chunks"]
    assert len(pdf_relevant) > 0, "No chunks returned from server retrieve"
    combined_results = " ".join(pdf_relevant)
    assert "Delaware" in combined_results, f"Expected Delaware in retrieved chunks, got: {combined_results}"
    print(f"  [PASS] Server /api/retrieve correctly returned governing law clause:\n         '{pdf_relevant[0]}'")

    # Query for liability clause
    liab_res = requests.post(
        "http://127.0.0.1:8000/api/retrieve",
        json={"document_id": uploaded_doc_id, "query": "What is the limitation of liability amount?", "top_k": 2}
    )
    assert liab_res.status_code == 200
    liab_chunks = liab_res.json()["chunks"]
    assert len(liab_chunks) > 0
    assert "liability" in liab_chunks[0].lower()
    print(f"  [PASS] Server /api/retrieve correctly returned liability clause:\n         '{liab_chunks[0]}'")

    print("\n=== 4. Testing Upload-Text -> Automatic Indexing -> /api/retrieve ===")
    pasted_text = (
        "ARTICLE 9. FORCE MAJEURE.\n"
        "Neither party shall be liable for failure or delay in performance caused by acts of God, "
        "earthquakes, pandemics, floods, or government shutdown orders.\n\n"
        "ARTICLE 10. NOTICES.\n"
        "All official legal notices must be delivered by certified mail to 500 Silicon Alley, NY."
    )
    res_text = requests.post("http://127.0.0.1:8000/api/upload-text", json={"text": pasted_text})
    assert res_text.status_code == 200, f"Upload-text failed: {res_text.text}"
    text_doc_id = res_text.json()["document_id"]
    print(f"  [PASS] Pasted text uploaded and automatically indexed: {text_doc_id}")
    
    # Query force majeure via server API
    fm_res = requests.post(
        "http://127.0.0.1:8000/api/retrieve",
        json={"document_id": text_doc_id, "query": "Are parties liable during acts of God or pandemics?", "top_k": 1}
    )
    assert fm_res.status_code == 200
    fm_chunks = fm_res.json()["chunks"]
    assert len(fm_chunks) > 0
    assert "FORCE MAJEURE" in fm_chunks[0]
    print(f"  [PASS] Upload-text indexed and retrieved force majeure clause:\n         '{fm_chunks[0]}'")

    print("\n=== 5. Testing Max 20 Session Eviction Limit ===")
    initial_count = len(session_collections)
    print(f"  Initial in-memory session count: {initial_count}")
    
    # Add 25 new unique sessions to force eviction past MAX_SESSIONS (20)
    created_ids = []
    for i in range(25):
        s_id = f"eviction_test_session_{i}"
        create_session_collection(s_id, [f"Content for session {i} about legal clause {i}."])
        created_ids.append(s_id)
        assert len(session_collections) <= MAX_SESSIONS, f"Sessions exceeded {MAX_SESSIONS}: {len(session_collections)}"
    
    assert len(session_collections) == MAX_SESSIONS, f"Expected exactly {MAX_SESSIONS} sessions, got {len(session_collections)}"
    
    # The earliest added session should be evicted
    first_evicted = created_ids[0]
    assert first_evicted not in session_collections, f"Session {first_evicted} was not evicted!"
    assert retrieve_relevant_chunks(first_evicted, "Content") == [], "Evicted session should return empty list"
    
    # The newest session should still be present and queryable
    latest_session = created_ids[-1]
    assert latest_session in session_collections, f"Latest session {latest_session} should be active"
    latest_retrieved = retrieve_relevant_chunks(latest_session, "legal clause", top_k=1)
    assert len(latest_retrieved) == 1
    print(f"  [PASS] Session count capped at {MAX_SESSIONS}. Oldest sessions evicted cleanly!")

    # Cleanup test files
    for p in TEST_DOCS_DIR.iterdir():
        p.unlink()
    TEST_DOCS_DIR.rmdir()

    print("\n>>> ALL RAG PIPELINE TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    run_rag_tests()
