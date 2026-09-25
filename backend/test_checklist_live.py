import urllib.request
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

text = """COMMERCIAL LEASE AGREEMENT
This Agreement is made on January 15, 2024, between Apex Properties LLC ("Landlord") and Nova Dynamics Inc ("Tenant").
1. PREMISES AND TERM: Landlord leases Suite 400 at 100 Innovation Way for a term of 36 months starting March 1, 2024.
2. BASE RENT: Tenant shall pay base rent of $6,500.00 per month, due on the first calendar day of each month. A late charge of $350 or 5% of overdue rent shall apply after a 5-day grace period.
3. SECURITY DEPOSIT: Tenant deposits $13,000.00 as security for performance.
4. REPAIRS AND MAINTENANCE: Tenant shall maintain interior fixtures and HVAC filters. Landlord maintains structural elements, roof, and exterior walls.
5. TERMINATION AND DEFAULT: Either party may terminate with 90 days written notice upon material breach remaining uncured after 30 days.
6. GOVERNING LAW: This Agreement is governed by the laws of California."""

# 1. Upload
req_up = urllib.request.Request(
    'http://127.0.0.1:8000/api/upload-text',
    data=json.dumps({'text': text}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
res_up = json.loads(urllib.request.urlopen(req_up).read().decode('utf-8'))
doc_id = res_up['document_id']
print(f"Uploaded Document ID: {doc_id}")

# 2. Call Checklist with document_id
req_check = urllib.request.Request(
    'http://127.0.0.1:8000/api/checklist',
    data=json.dumps({'document_id': doc_id, 'language': 'en'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
res_check = json.loads(urllib.request.urlopen(req_check).read().decode('utf-8'))

print("\n=== Pre-Signing Checklist ===")
for i, item in enumerate(res_check.get("before_signing_checklist", []), 1):
    print(f"[{i}] {item}")

print("\n=== Questions to Ask Legal Counsel ===")
for i, q in enumerate(res_check.get("questions_to_ask", []), 1):
    print(f"[Q{i}] {q}")

assert len(res_check.get("before_signing_checklist", [])) >= 3
assert len(res_check.get("questions_to_ask", [])) >= 2
print("\n>>> ALL CHECKLIST VERIFICATIONS PASSED! <<<")
