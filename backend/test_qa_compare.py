import sys
import io
from pathlib import Path

# Ensure root directory is on sys.path
_ROOT_DIR = str(Path(__file__).resolve().parent.parent)
if _ROOT_DIR not in sys.path:
    sys.path.insert(0, _ROOT_DIR)

import requests
from backend.core.qa import answer_document_question
from backend.core.compare import compare_documents
from backend.core.rag import create_session_collection, session_collections, chunk_document

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ========== Test Documents ==========
# Document with specific, verifiable facts for Q&A
QA_DOCUMENT_TEXT = """
RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement is entered into on March 1, 2026, between Maple Realty ("Landlord") 
and Alice Sharma ("Tenant"), for the property located at 19 Birchwood Lane, Columbus, Ohio 43215.

1. LEASE TERM
The lease commences on March 1, 2026 and expires on February 28, 2027, constituting a fixed-term tenancy of exactly twelve (12) months.

2. MONTHLY RENT
The Tenant agrees to pay a monthly rent of $1,850.00. Rent is due on the 1st day of each month.
A late payment charge of $75.00 applies if payment is not received within a five-day grace period.

3. SECURITY DEPOSIT
Upon execution, Tenant shall pay a security deposit of $3,700.00 (equal to two months' rent) to Landlord.
The deposit shall be returned within 30 days after lease expiration, minus any documented deductions.

4. MAINTENANCE
Tenant is responsible for lawn care and minor repairs under $150. Major repairs remain the Landlord's obligation.

5. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Ohio.
"""

# Contract A — Baseline lease
CONTRACT_A = """
LEASE AGREEMENT — CONTRACT A

Tenant: Bob Chen. Landlord: Greenfield Properties.
Property: 42 Oakdale Avenue, Suite 3B, Portland, Oregon.

Monthly Rent: $2,400.00 per month, payable on the 1st.
Late Fee: $100.00 if not paid within 3 days.
Security Deposit: $4,800.00 (non-refundable if vacated early).
Lease Term: 12 months (March 1, 2026 — February 28, 2027).
Auto-Renewal: Automatically renews for another 12 months unless 60 days' written notice given.
Governing Law: State of Oregon.
"""

# Contract B — Same property, different terms 
CONTRACT_B = """
LEASE AGREEMENT — CONTRACT B

Tenant: Bob Chen. Landlord: Greenfield Properties.
Property: 42 Oakdale Avenue, Suite 3B, Portland, Oregon.

Monthly Rent: $2,100.00 per month, payable on the 1st.
Late Fee: $50.00 if not paid within 7 days.
Security Deposit: $2,100.00 (refundable within 21 days of vacating).
Lease Term: 6 months (March 1, 2026 — August 31, 2026).
Auto-Renewal: Does not auto-renew. Requires new signed agreement to continue.
Governing Law: State of Oregon.
"""

def index_qa_document() -> str:
    """Index the Q&A test document and return doc_id."""
    doc_id = "qa_test_doc_lease_001"
    chunks = chunk_document(QA_DOCUMENT_TEXT)
    create_session_collection(doc_id, chunks)
    assert doc_id in session_collections
    print(f"  Indexed Q&A document ({len(chunks)} chunks) with ID: {doc_id}")
    return doc_id

def run_tests():
    print("=== 1. Indexing Q&A Document and Testing answer_document_question() ===")
    doc_id = index_qa_document()

    # Test 1a: Specific factual question — monthly rent
    result_rent = answer_document_question(doc_id, "What is the monthly rent amount?", language="en")
    print(f"\n  Q: 'What is the monthly rent amount?'")
    print(f"  A: {result_rent['answer']}")
    print(f"  Confidence: {result_rent['confidence']}")
    print(f"  Source: {result_rent['source_excerpt'][:100]}...")
    assert "1,850" in result_rent["answer"] or "1850" in result_rent["answer"] or \
           "1,850" in result_rent["source_excerpt"] or "1850" in result_rent["source_excerpt"], \
        f"Rent amount not found in answer or source: {result_rent}"
    assert result_rent["confidence"] in ["high", "medium", "low"]
    print("  [PASS] Correct rent amount returned.")

    # Test 1b: Specific factual question — security deposit
    result_deposit = answer_document_question(doc_id, "How much is the security deposit?", language="en")
    print(f"\n  Q: 'How much is the security deposit?'")
    print(f"  A: {result_deposit['answer']}")
    assert "3,700" in result_deposit["answer"] or "3700" in result_deposit["answer"] or \
           "3,700" in result_deposit["source_excerpt"] or "3700" in result_deposit["source_excerpt"], \
        f"Deposit not found in answer or source: {result_deposit}"
    print("  [PASS] Correct security deposit amount returned.")

    # Test 1c: Specific factual question — lease start date
    result_date = answer_document_question(doc_id, "When does the lease start?", language="en")
    print(f"\n  Q: 'When does the lease start?'")
    print(f"  A: {result_date['answer']}")
    assert "March" in result_date["answer"] or "2026" in result_date["answer"] or \
           "March" in result_date["source_excerpt"] or "2026" in result_date["source_excerpt"], \
        f"Start date not found in answer or source: {result_date}"
    print("  [PASS] Correct lease start date returned.")

    # Test 1d: Similarity threshold gate — question about something NOT in the document
    result_notfound = answer_document_question(doc_id, "What are the parking regulations?", language="en")
    print(f"\n  Q: 'What are the parking regulations?'")
    print(f"  A: {result_notfound['answer']}")
    assert result_notfound["confidence"] in ["low", "medium"]
    # Expect either a "doesn't address" response OR a low-confidence one
    not_found_indicators = ["doesn't appear", "not address", "not contain", "no information", "not found", "does not"]
    is_not_found = any(ind in result_notfound["answer"].lower() for ind in not_found_indicators)
    low_confidence = result_notfound["confidence"] == "low"
    assert is_not_found or low_confidence, \
        f"Expected not-found or low confidence for out-of-scope question, got: {result_notfound}"
    print("  [PASS] Out-of-scope question correctly handled (not found / low confidence).")

    print("\n=== 2. Testing POST /api/ask Endpoint ===")
    res_ask = requests.post("http://127.0.0.1:8000/api/upload-text", json={"text": QA_DOCUMENT_TEXT})
    assert res_ask.status_code == 200, f"Upload failed: {res_ask.text}"
    uploaded_id = res_ask.json()["document_id"]

    api_result = requests.post("http://127.0.0.1:8000/api/ask", json={
        "document_id": uploaded_id,
        "question": "What is the late payment charge?",
        "language": "en"
    })
    assert api_result.status_code == 200, f"/api/ask failed: {api_result.text}"
    ask_data = api_result.json()
    assert "answer" in ask_data
    assert "source_excerpt" in ask_data
    assert "confidence" in ask_data
    assert "75" in ask_data["answer"] or "75" in ask_data["source_excerpt"], \
        f"Late fee $75 not in response: {ask_data}"
    print(f"  [PASS] /api/ask returned correct late fee answer:")
    print(f"         Answer: {ask_data['answer']}")
    print(f"         Confidence: {ask_data['confidence']}")

    print("\n=== 3. Testing compare_documents() with Two Lease Variants ===")
    comparison = compare_documents(CONTRACT_A, CONTRACT_B, language="en")
    points = comparison["comparison_points"]
    summary = comparison["overall_summary"]
    
    print(f"  Found {len(points)} comparison points.")
    assert len(points) >= 2, f"Expected at least 2 comparison points, got {len(points)}"
    
    aspects = [p["aspect"].lower() for p in points]
    print(f"  Aspects: {[p['aspect'] for p in points]}")
    
    # Check rent difference detected
    rent_found = any("rent" in a for a in aspects)
    assert rent_found, f"Monthly rent difference not detected. Aspects: {aspects}"
    
    # Check a point has valid more_favorable
    for pt in points:
        assert pt["more_favorable"] in ["a", "b", "neutral"], f"Invalid more_favorable: {pt}"
    
    # Verify Contract B is better for rent ($2100 < $2400)
    rent_pts = [p for p in points if "rent" in p["aspect"].lower()]
    if rent_pts:
        assert rent_pts[0]["more_favorable"] == "b", \
            f"Expected Contract B (lower rent $2100) to be more favorable, got: {rent_pts[0]['more_favorable']}"
        print(f"  [PASS] Rent difference detected — Contract B correctly identified as more favorable:")
        print(f"         Document A: {rent_pts[0]['document_a_value']}")
        print(f"         Document B: {rent_pts[0]['document_b_value']}")

    print(f"\n  Overall Summary: {summary}")
    assert len(summary) > 20
    print("  [PASS] compare_documents() returned structured, accurate comparison.")

    print("\n=== 4. Testing POST /api/compare Endpoint ===")
    api_compare = requests.post("http://127.0.0.1:8000/api/compare", json={
        "text_a": CONTRACT_A,
        "text_b": CONTRACT_B,
        "language": "en"
    })
    assert api_compare.status_code == 200, f"/api/compare failed: {api_compare.text}"
    cmp_data = api_compare.json()
    assert "comparison_points" in cmp_data
    assert "overall_summary" in cmp_data
    assert len(cmp_data["comparison_points"]) >= 2
    print(f"  [PASS] /api/compare returned {len(cmp_data['comparison_points'])} comparison points.")

    print("\n=== 5. Testing Multilingual Q&A (Hindi) via /api/ask ===")
    api_hi = requests.post("http://127.0.0.1:8000/api/ask", json={
        "document_id": uploaded_id,
        "question": "How many months is the lease term?",
        "language": "hi"
    })
    assert api_hi.status_code == 200
    hi_data = api_hi.json()
    assert "answer" in hi_data
    assert hi_data["language"] == "hi"
    print(f"  [PASS] Hindi Q&A returned — language: {hi_data['language']}, confidence: {hi_data['confidence']}")

    print("\n>>> ALL Q&A AND COMPARISON TESTS PASSED! <<<")

if __name__ == "__main__":
    run_tests()
