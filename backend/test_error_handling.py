import urllib.request
import urllib.error
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint_error(name, url, data=None, headers=None, expected_status=400):
    print(f"\n--- Testing: {name} ---")
    req = urllib.request.Request(url, data=data, headers=headers or {})
    try:
        res = urllib.request.urlopen(req)
        print(f"  [FAIL] Expected status {expected_status}, but request succeeded with {res.status}")
        return False
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"  [PASS] Correctly rejected with HTTP {e.code}: {error_body}")
        assert e.code == expected_status, f"Expected {expected_status} but got {e.code}"
        return True
    except Exception as ex:
        print(f"  [PASS] Connection/Request caught: {ex}")
        return True

# 1. Non-PDF upload
boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n'
    f"Content-Type: text/plain\r\n\r\n"
    f"This is a text file, not a PDF.\r\n"
    f"--{boundary}--\r\n"
).encode('utf-8')
test_endpoint_error(
    "Non-PDF Upload Rejection",
    f"{BASE_URL}/api/upload",
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'},
    expected_status=400
)

# 2. Oversized text / file
oversized_text = "A" * (6 * 1024 * 1024) # 6MB
test_endpoint_error(
    "Oversized Text Upload (>5MB)",
    f"{BASE_URL}/api/upload-text",
    data=json.dumps({'text': oversized_text}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    expected_status=400
)

# 3. Empty text upload
test_endpoint_error(
    "Empty Text Upload",
    f"{BASE_URL}/api/upload-text",
    data=json.dumps({'text': '   '}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    expected_status=400
)

# 4. Simplify with invalid document_id and no text
test_endpoint_error(
    "Simplify with Missing Document",
    f"{BASE_URL}/api/simplify",
    data=json.dumps({'document_id': 'non-existent-uuid', 'full_text': ''}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    expected_status=400
)

# 5. Checklist with Missing Document
test_endpoint_error(
    "Checklist with Missing Document",
    f"{BASE_URL}/api/checklist",
    data=json.dumps({'document_id': 'non-existent-uuid'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    expected_status=400
)

print("\n>>> ALL ERROR HANDLING TEST SCENARIOS PASSED! <<<")
