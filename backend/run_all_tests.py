"""
AI Legal Document Assistant — Unified Test Suite Runner
Runs all unit, integration, error-handling, RAG, and multilingual tests.
"""

import sys
import subprocess
from pathlib import Path

# Ensure root directory is on sys.path
_ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT_DIR))

TESTS = [
    ("1. Core Pipeline & Upload Validation", "backend/tests/test_pipeline.py"),
    ("2. Error Handling & Edge Cases", "backend/tests/test_error_handling.py"),
    ("3. Document Simplification & Risk Classification", "backend/tests/test_analysis.py"),
    ("4. RAG Chunks & Ephemeral In-Memory Indexing", "backend/tests/test_rag_pipeline.py"),
    ("5. Q&A Grounding & Contract Comparison", "backend/tests/test_qa_compare.py"),
    ("6. End-to-End Q&A Verification", "backend/tests/test_qa_e2e.py"),
    ("7. Pre-Signing Checklist & Lawyer Prep", "backend/tests/test_checklist.py"),
]

def main():
    print("=" * 70)
    print("AI LEGAL DOCUMENT ASSISTANT — AUTOMATED TEST SUITE")
    print("=" * 70)

    total = len(TESTS)
    passed = 0

    for title, test_script in TESTS:
        print(f"\n[RUNNING] {title} ({test_script})...")
        cmd = [sys.executable, str(_ROOT_DIR / test_script)]
        res = subprocess.run(cmd, cwd=str(_ROOT_DIR))
        if res.returncode == 0:
            print(f"[PASS] {title}")
            passed += 1
        else:
            print(f"[FAIL] {title} (exit code: {res.returncode})")

    print("\n" + "=" * 70)
    print(f"RESULTS: {passed}/{total} test suites passed ({passed/total*100:.1f}%)")
    print("=" * 70)

    if passed == total:
        print("\n>>> ALL TEST SUITES PASSED! 100% SUCCESSFUL EVALUATION <<<\n")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
