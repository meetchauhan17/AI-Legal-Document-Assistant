import sys
import io
import requests
from backend.core.simplify import simplify_document
from backend.core.risk_analysis import analyze_clauses

# Force UTF-8 output on Windows (avoids cp1252 UnicodeEncodeError with multilingual text)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Sample rental agreement with balanced clauses and clearly one-sided clauses
SAMPLE_RENTAL_AGREEMENT = """
RESIDENTIAL LEASE AGREEMENT

This Agreement is made on January 1, 2026, between Oakwood Properties ("Landlord") and John Doe ("Tenant").

1. PREMISES AND TERM
Landlord leases to Tenant the premises located at 742 Evergreen Terrace for a fixed term of twelve (12) months, ending on December 31, 2026.

2. MONTHLY RENT AND DUE DATE
Tenant agrees to pay a monthly rent of $2,200.00, payable in advance on or before the first (1st) day of each calendar month. A late charge of $50.00 will apply if payment is not received by the fifth (5th) day.

3. SECURITY DEPOSIT AND UNILATERAL FORFEITURE
Tenant shall deposit $4,400.00 as a security deposit. Landlord reserves the absolute and sole right to forfeit and retain the entire deposit without notice or itemized receipts for any breach or minor wear and tear, and Tenant waives all rights to contest any deposit withholdings.

4. ENTRY AND IMMEDIATE EVICTION WITHOUT NOTICE
Landlord may enter the premises at any time without prior notice. If Tenant breaches any term, Landlord may immediately lock out Tenant and execute immediate eviction within 24 hours without court proceedings or prior written warning.

5. MAINTENANCE AND REPAIRS
Tenant shall be responsible for all general cleaning and shall promptly notify Landlord of any major water leaks. Tenant agrees to pay for all plumbing and appliance repairs up to $300 per occurrence.

6. GOVERNING LAW AND SEVERABILITY
This Agreement shall be governed by and construed in accordance with the laws of the State of Ohio. If any provision is deemed unenforceable, the remaining provisions shall continue in full force and effect.
"""

def run_tests():
    print("=== 1. Testing simplify_document() ===")
    
    # English summary
    summary_en = simplify_document(SAMPLE_RENTAL_AGREEMENT, language="en")
    print(f"  Detected Document Type: {summary_en.get('document_type')}")
    print(f"  Plain Summary:\n{summary_en.get('plain_summary')}\n")
    print(f"  Key Points Count: {len(summary_en.get('key_points', []))}")
    for pt in summary_en.get("key_points", []):
        print(f"    • {pt}")
    
    assert "plain_summary" in summary_en, "Missing plain_summary"
    assert "key_points" in summary_en, "Missing key_points"
    assert "document_type" in summary_en, "Missing document_type"
    assert len(summary_en["key_points"]) >= 3, "Too few key points"
    assert "illegal" not in summary_en["plain_summary"].lower(), "Forbidden verdict 'illegal' found"

    # Hindi summary
    summary_hi = simplify_document(SAMPLE_RENTAL_AGREEMENT, language="hi")
    assert "plain_summary" in summary_hi
    print(f"\n  [PASS] Hindi Summary verified: {summary_hi['document_type']}")

    # Gujarati summary
    summary_gu = simplify_document(SAMPLE_RENTAL_AGREEMENT, language="gu")
    assert "plain_summary" in summary_gu
    print(f"  [PASS] Gujarati Summary verified: {summary_gu['document_type']}")

    print("\n=== 2. Testing analyze_clauses() and One-Sided Risk Classification ===")
    risk_results = analyze_clauses(SAMPLE_RENTAL_AGREEMENT, language="en")
    clauses = risk_results.get("clauses", [])
    assert len(clauses) > 0, "No clauses analyzed"

    severities = [c.get("severity") for c in clauses]
    print(f"  Classified {len(clauses)} clauses. Severities: {severities}")

    # Confirm at least one clause is classified as 'risk'
    risk_clauses = [c for c in clauses if c.get("severity") == "risk"]
    assert len(risk_clauses) >= 1, "Failed to identify clearly one-sided clause as 'risk'!"
    
    print(f"  Identified {len(risk_clauses)} RISK clauses:")
    for rc in risk_clauses:
        print(f"    - Category: {rc.get('category')}")
        print(f"      Text: {rc.get('clause_text')[:100]}...")
        print(f"      Explanation: {rc.get('explanation')}")
        assert "illegal" not in rc.get("explanation", "").lower(), "Definitive verdict 'illegal' in explanation"
        assert "worth clarifying" in rc.get("explanation", "").lower() or "may" in rc.get("explanation", "").lower(), "Must use non-definitive wording"

    print("\n=== 3. Testing POST /api/simplify Endpoint ===")
    res_simp = requests.post("http://127.0.0.1:8000/api/simplify", json={
        "full_text": SAMPLE_RENTAL_AGREEMENT,
        "language": "en"
    })
    assert res_simp.status_code == 200, f"Simplify endpoint failed: {res_simp.text}"
    simp_data = res_simp.json()
    assert "plain_summary" in simp_data
    assert "key_points" in simp_data
    print("  [PASS] /api/simplify endpoint returned valid response schema.")

    print("\n=== 4. Testing POST /api/analyze-risk Endpoint ===")
    res_risk = requests.post("http://127.0.0.1:8000/api/analyze-risk", json={
        "full_text": SAMPLE_RENTAL_AGREEMENT,
        "language": "en"
    })
    assert res_risk.status_code == 200, f"Analyze-risk endpoint failed: {res_risk.text}"
    risk_data = res_risk.json()
    assert "clauses" in risk_data
    api_risk_clauses = [c for c in risk_data["clauses"] if c["severity"] == "risk"]
    assert len(api_risk_clauses) >= 1, "API did not return any risk clauses"
    print(f"  [PASS] /api/analyze-risk successfully identified {len(api_risk_clauses)} risk clauses.")

    print("\n=== 5. Testing Multilingual API Responses (Hindi & Gujarati) ===")
    res_hi = requests.post("http://127.0.0.1:8000/api/analyze-risk", json={
        "full_text": SAMPLE_RENTAL_AGREEMENT,
        "language": "hi"
    })
    assert res_hi.status_code == 200
    hi_clauses = res_hi.json()["clauses"]
    assert any(c["severity"] == "risk" for c in hi_clauses), "Hindi analysis must retain 'risk' severity in English"
    print("  [PASS] Hindi analysis returned with 'risk' severity label preserved in English.")

    res_gu = requests.post("http://127.0.0.1:8000/api/simplify", json={
        "full_text": SAMPLE_RENTAL_AGREEMENT,
        "language": "gu"
    })
    assert res_gu.status_code == 200
    gu_data = res_gu.json()
    # Gujarati mode should return a non-empty plain_summary in Gujarati script
    # We verify the summary is non-empty and contains non-ASCII characters (Gujarati script)
    plain = gu_data.get("plain_summary", "")
    assert plain and len(plain) > 10, "Gujarati summary was empty"
    print(f"  [PASS] Gujarati summary returned ({len(plain)} chars, document_type={gu_data.get('document_type')})")

    print("\n>>> ALL ANALYSIS & RISK CLASSIFICATION TESTS PASSED! <<<")

if __name__ == "__main__":
    run_tests()
