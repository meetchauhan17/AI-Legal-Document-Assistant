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

# 1. Upload & index
req = urllib.request.Request(
    'http://127.0.0.1:8000/api/upload-text',
    data=json.dumps({'text': text}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
doc_id = res['document_id']
print(f'Uploaded & Indexed Document ID: {doc_id}')

# 2. Ask Q1
q1 = 'What is the monthly base rent and late fee?'
req1 = urllib.request.Request(
    'http://127.0.0.1:8000/api/ask',
    data=json.dumps({'document_id': doc_id, 'question': q1, 'language': 'en'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
ans1 = json.loads(urllib.request.urlopen(req1).read().decode('utf-8'))
print('\n--- Question 1 ---')
print(f'Q: {q1}')
print(f'Answer: {ans1.get("answer")}')
print(f'Confidence: {ans1.get("confidence")}')
print(f'Source excerpt: {ans1.get("source_excerpt")}')

# 3. Ask Q2
q2 = 'Who is responsible for repairs and maintenance?'
req2 = urllib.request.Request(
    'http://127.0.0.1:8000/api/ask',
    data=json.dumps({'document_id': doc_id, 'question': q2, 'language': 'en'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
ans2 = json.loads(urllib.request.urlopen(req2).read().decode('utf-8'))
print('\n--- Question 2 ---')
print(f'Q: {q2}')
print(f'Answer: {ans2.get("answer")}')
print(f'Confidence: {ans2.get("confidence")}')
print(f'Source excerpt: {ans2.get("source_excerpt")}')

# 4. Ask Q3 (out of scope)
q3 = 'What is the policy for pets?'
req3 = urllib.request.Request(
    'http://127.0.0.1:8000/api/ask',
    data=json.dumps({'document_id': doc_id, 'question': q3, 'language': 'en'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
ans3 = json.loads(urllib.request.urlopen(req3).read().decode('utf-8'))
print('\n--- Question 3 (Out-of-scope) ---')
print(f'Q: {q3}')
print(f'Answer: {ans3.get("answer")}')
print(f'Confidence: {ans3.get("confidence")}')
print(f'Source excerpt: {ans3.get("source_excerpt")}')
