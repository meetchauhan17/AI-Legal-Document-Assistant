import urllib.request
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

doc_a = """LEASE AGREEMENT — CONTRACT A
Tenant: Bob Chen. Landlord: Greenfield Properties LLC.
Property: 42 Oakdale Avenue, Suite 3B, Portland, Oregon.

1. MONTHLY RENT: $2,400.00 per month, payable in advance on the 1st of each month.
2. LATE PAYMENT FEE: $100.00 flat fee if not received within a 3-day grace period.
3. SECURITY DEPOSIT: $4,800.00 (non-refundable if tenant vacates prior to full lease term).
4. LEASE TERM: 12 months (March 1, 2026 to February 28, 2027).
5. AUTO-RENEWAL: Automatically renews for another 12-month term unless written notice is received 60 days in advance.
6. MAINTENANCE & REPAIRS: Tenant is responsible for all plumbing repairs and HVAC servicing regardless of cost.
7. GOVERNING LAW: State of Oregon."""

doc_b = """LEASE AGREEMENT — CONTRACT B
Tenant: Bob Chen. Landlord: Greenfield Properties LLC.
Property: 42 Oakdale Avenue, Suite 3B, Portland, Oregon.

1. MONTHLY RENT: $2,100.00 per month, payable in advance on the 1st of each month.
2. LATE PAYMENT FEE: $50.00 fee if not received within a 7-day grace period.
3. SECURITY DEPOSIT: $2,100.00 (fully refundable within 30 days of lease end minus documented damages).
4. LEASE TERM: 12 months (March 1, 2026 to February 28, 2027).
5. RENEWAL: Converts to month-to-month tenancy upon expiration with 30 days written notice.
6. MAINTENANCE & REPAIRS: Landlord handles all major HVAC and structural repairs; Tenant handles minor repairs under $100.
7. GOVERNING LAW: State of Oregon."""

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/compare',
    data=json.dumps({'text_a': doc_a, 'text_b': doc_b, 'language': 'en'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))

print("=== Comparison API Response ===")
print("Overall Summary:")
print(res.get("overall_summary"))
print("\nComparison Points Count:", len(res.get("comparison_points", [])))
for i, pt in enumerate(res.get("comparison_points", []), 1):
    print(f"\n[{i}] Aspect: {pt.get('aspect')}")
    print(f"    Doc A: {pt.get('document_a_value')}")
    print(f"    Doc B: {pt.get('document_b_value')}")
    print(f"    More Favorable: {pt.get('more_favorable')}")
    print(f"    Note: {pt.get('note') or pt.get('explanation')}")

assert len(res.get("comparison_points", [])) >= 2
print("\n>>> ALL COMPARE VERIFICATIONS PASSED! <<<")
