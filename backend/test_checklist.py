import sys
import io
import requests
from backend.core.checklist import generate_checklist

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ── Test document: rental agreement with clearly named sections and specific amounts ──

SAMPLE_AGREEMENT = """
RESIDENTIAL LEASE AGREEMENT

This agreement is entered between Horizon Properties LLC ("Landlord") and David Patel ("Tenant")
for the premises at 88 Sunflower Drive, Austin, Texas 78701.

1. LEASE TERM
The lease term is twelve (12) months, commencing January 1, 2026 and ending December 31, 2026.

2. MONTHLY RENT AND LATE FEE
Tenant shall pay monthly rent of $2,500.00 due on the first (1st) of each month.
A late fee of $150.00 applies if rent is not received within three (3) days of the due date.

3. SECURITY DEPOSIT AND FORFEITURE
Tenant shall deposit $5,000.00 as a security deposit prior to move-in.
Landlord reserves the unilateral right to retain the entire $5,000.00 deposit for any breach
of this agreement, without requiring an inspection report or itemised deduction statement.

4. AUTO-RENEWAL TRAP
This lease shall automatically renew for an additional 12-month term unless Tenant provides
written notice of non-renewal at least ninety (90) days before lease expiration.
Failure to provide such notice shall bind Tenant to a new 12-month lease.

5. ENTRY WITHOUT NOTICE
Landlord may enter the premises at any time, for any reason, without prior notice to Tenant.

6. GOVERNING LAW
This Agreement is governed by the laws of the State of Texas.
"""

# Risk clauses mimicking what analyze_clauses() would return for this document
SAMPLE_RISK_CLAUSES = [
    {
        "clause_text": "3. SECURITY DEPOSIT AND FORFEITURE\nLandlord reserves the unilateral right to retain the entire $5,000.00 deposit...",
        "category": "Security Deposit Forfeiture",
        "category_level": "risk",
        "explanation": "This may be worth clarifying because the landlord can retain the full $5,000 deposit without providing an inspection report or itemised list of deductions."
    },
    {
        "clause_text": "4. AUTO-RENEWAL TRAP\nThis lease shall automatically renew for an additional 12-month term unless Tenant provides written notice at least ninety (90) days before expiration.",
        "category": "Auto-Renewal",
        "category_level": "risk",
        "explanation": "This may be worth clarifying because the 90-day notice window is unusually long and could trap the tenant in an unwanted 12-month renewal."
    },
    {
        "clause_text": "5. ENTRY WITHOUT NOTICE\nLandlord may enter the premises at any time, for any reason, without prior notice to Tenant.",
        "category": "Entry Without Notice",
        "category_level": "risk",
        "explanation": "This may be worth clarifying because most jurisdictions require at least 24-48 hours written notice before a landlord may enter a rented property."
    },
    {
        "clause_text": "2. MONTHLY RENT AND LATE FEE\nA late fee of $150.00 applies if rent is not received within three (3) days.",
        "category": "Late Fee",
        "category_level": "attention",
        "explanation": "A $150 late fee with only a 3-day grace period may be worth clarifying — many agreements allow 5-7 days."
    }
]

# Specific content that MUST appear in checklist/questions to prove they are grounded
SPECIFICITY_MARKERS = [
    "5,000",        # deposit amount
    "5000",         # deposit amount (unformatted)
    "2,500",        # rent amount
    "2500",
    "150",          # late fee
    "90",           # auto-renewal notice days
    "ninety",       # auto-renewal notice (words)
    "3",            # grace period days (rent)
    "Section",      # section reference style
    "forfeiture",   # section name
    "Forfeiture",
    "auto-renewal", # clause type
    "Auto-Renewal",
    "renewal",
    "entry",        # clause type
    "Entry",
    "deposit",
    "Deposit",
    "January",      # date
    "December",     # date
    "12-month",     # duration
    "12 month",
    "three",        # grace period (words)
    "Texas",        # governing law
]

def has_specific_reference(text: str) -> bool:
    """Returns True if the text contains at least one document-specific term."""
    text_lower = text.lower()
    for marker in SPECIFICITY_MARKERS:
        if marker.lower() in text_lower:
            return True
    return False

def run_tests():
    print("=== 1. Testing generate_checklist() — Unit Test ===")
    result = generate_checklist(
        full_text=SAMPLE_AGREEMENT,
        risk_clauses=SAMPLE_RISK_CLAUSES,
        language="en"
    )

    checklist = result.get("before_signing_checklist", [])
    questions = result.get("questions_to_ask", [])

    print(f"\n  Checklist ({len(checklist)} items):")
    for i, item in enumerate(checklist, 1):
        specific = has_specific_reference(item)
        marker = "[SPECIFIC]" if specific else "[GENERIC!]"
        print(f"    {i}. {marker} {item[:120]}")

    print(f"\n  Questions to Ask ({len(questions)} items):")
    for i, q in enumerate(questions, 1):
        specific = has_specific_reference(q)
        marker = "[SPECIFIC]" if specific else "[GENERIC!]"
        print(f"    {i}. {marker} {q[:120]}")

    # Assertions
    assert len(checklist) >= 5, f"Expected >= 5 checklist items, got {len(checklist)}"
    assert len(questions) >= 3, f"Expected >= 3 questions, got {len(questions)}"

    # At least 3 checklist items must reference specific document content
    specific_checklist = [item for item in checklist if has_specific_reference(item)]
    assert len(specific_checklist) >= 3, (
        f"Expected >= 3 SPECIFIC checklist items (referencing actual document content), "
        f"but only {len(specific_checklist)}/{len(checklist)} were specific.\n"
        f"Items: {checklist}"
    )
    print(f"\n  [PASS] {len(specific_checklist)}/{len(checklist)} checklist items are document-specific.")

    # At least 2 questions must reference specific document content
    specific_questions = [q for q in questions if has_specific_reference(q)]
    assert len(specific_questions) >= 2, (
        f"Expected >= 2 SPECIFIC questions, but only {len(specific_questions)}/{len(questions)} were specific.\n"
        f"Questions: {questions}"
    )
    print(f"  [PASS] {len(specific_questions)}/{len(questions)} questions are document-specific.")

    # Verify no definitive legal verdicts
    all_text = " ".join(checklist + questions).lower()
    forbidden = ["this is illegal", "this clause is illegal", "legally void", "against the law"]
    for phrase in forbidden:
        assert phrase not in all_text, f"Found forbidden legal verdict phrase: '{phrase}'"
    print("  [PASS] No definitive legal verdict phrases found.")

    print("\n=== 2. Testing POST /api/checklist Endpoint (full_text mode) ===")
    res = requests.post("http://127.0.0.1:8000/api/checklist", json={
        "full_text": SAMPLE_AGREEMENT,
        "risk_clauses": SAMPLE_RISK_CLAUSES,
        "language": "en"
    })
    assert res.status_code == 200, f"/api/checklist failed: {res.status_code} — {res.text}"
    api_data = res.json()
    assert "before_signing_checklist" in api_data
    assert "questions_to_ask" in api_data
    assert len(api_data["before_signing_checklist"]) >= 5
    assert len(api_data["questions_to_ask"]) >= 3
    print(f"  [PASS] /api/checklist returned {len(api_data['before_signing_checklist'])} checklist items.")

    print("\n=== 3. Testing POST /api/checklist via document_id (upload → checklist flow) ===")
    # Upload the document first
    upload_res = requests.post("http://127.0.0.1:8000/api/upload-text", json={"text": SAMPLE_AGREEMENT})
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    doc_id = upload_res.json()["document_id"]

    # Now call checklist using document_id (no full_text)
    checklist_res = requests.post("http://127.0.0.1:8000/api/checklist", json={
        "document_id": doc_id,
        "risk_clauses": SAMPLE_RISK_CLAUSES,
        "language": "en"
    })
    assert checklist_res.status_code == 200, f"/api/checklist (doc_id) failed: {checklist_res.text}"
    id_data = checklist_res.json()
    assert id_data["document_id"] == doc_id
    assert len(id_data["before_signing_checklist"]) >= 5
    print(f"  [PASS] /api/checklist via document_id returned {len(id_data['before_signing_checklist'])} items.")

    print("\n=== 4. Testing /api/checklist — Hindi Language ===")
    hi_res = requests.post("http://127.0.0.1:8000/api/checklist", json={
        "full_text": SAMPLE_AGREEMENT,
        "risk_clauses": SAMPLE_RISK_CLAUSES,
        "language": "hi"
    })
    assert hi_res.status_code == 200
    hi_data = hi_res.json()
    assert hi_data["language"] == "hi"
    assert len(hi_data["before_signing_checklist"]) >= 3
    print(f"  [PASS] Hindi checklist returned {len(hi_data['before_signing_checklist'])} items.")

    print("\n=== 5. Testing /api/checklist — No full_text, No document_id → 400 Error ===")
    err_res = requests.post("http://127.0.0.1:8000/api/checklist", json={
        "risk_clauses": [],
        "language": "en"
    })
    assert err_res.status_code == 400, f"Expected 400, got {err_res.status_code}"
    print("  [PASS] 400 returned when neither full_text nor document_id is provided.")

    print("\n>>> ALL CHECKLIST TESTS PASSED! <<<")

if __name__ == "__main__":
    run_tests()
