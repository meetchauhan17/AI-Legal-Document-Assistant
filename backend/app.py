"""
AI Legal Document Assistant — Hugging Face Space Entrypoint
============================================================
This file is the entry point for Hugging Face Spaces deployment only.
It is NOT used by the local development server or the Vercel production deployment.

For local development, run:  uvicorn main:app --reload
For production, the app is deployed on Vercel via Next.js serverless functions.

Gradio and the `spaces` SDK are only available inside the HF Spaces runtime;
both are guarded with try/except so this file can be imported without errors
in any other environment (e.g., local IDE, CI).
"""

import sys
import types
from pathlib import Path

# ---------------------------------------------------------------------------
# Module path shim — supports running directly inside HF Spaces where
# 'core' is a sibling directory rather than a sub-package of 'backend'.
# ---------------------------------------------------------------------------
_APP_DIR = Path(__file__).resolve().parent
if "backend" not in sys.modules and (_APP_DIR / "core").exists():
    _pkg = types.ModuleType("backend")
    _pkg.__path__ = [str(_APP_DIR)]
    sys.modules["backend"] = _pkg
if str(_APP_DIR) not in sys.path:
    sys.path.insert(0, str(_APP_DIR))

# ---------------------------------------------------------------------------
# Hugging Face ZeroGPU startup check — only runs inside HF Spaces.
# The `spaces` package does not exist in local or Vercel environments.
# ---------------------------------------------------------------------------
try:
    import spaces  # type: ignore[import-not-found]

    @spaces.GPU  # type: ignore[misc]
    def _zero_gpu_check() -> bool:
        return True

    _zero_gpu_check()
except Exception:
    pass  # Not running in HF Spaces — skip silently.

# ---------------------------------------------------------------------------
# Gradio + FastAPI mount — only available in HF Spaces runtime.
# Skipped gracefully in all other environments.
# ---------------------------------------------------------------------------
try:
    import gradio as gr  # type: ignore[import-not-found]
    from main import app as fastapi_app  # noqa: E402

    with gr.Blocks(title="AI Legal Document Assistant API") as _demo:
        gr.Markdown(
            """
            # AI Legal Document Assistant — Backend API

            **Status**: Online and running on Hugging Face Spaces (16 GB RAM)

            This Space hosts the FastAPI backend powering the Next.js web application.

            ### Active Endpoints
            - `POST /api/upload` — PDF extraction and parsing
            - `POST /api/upload-text` — Direct text ingestion
            - `POST /api/simplify` — Plain-English translation with key points
            - `POST /api/analyze-risk` — Three-tier clause risk classification
            - `POST /api/ask` — Grounded RAG question answering with clause citations
            - `POST /api/compare` — Dual-contract comparative analysis
            - `POST /api/checklist` — Pre-signing negotiation checklist
            - `GET  /api/health` — Backend health status
            """
        )

    # Mount Gradio at /status to avoid conflicting with FastAPI's /api/* routes.
    app = gr.mount_gradio_app(fastapi_app, _demo, path="/status")

except ImportError:
    # Gradio is not installed — this is expected outside HF Spaces.
    # Expose the raw FastAPI app as a fallback so uvicorn can still serve it.
    try:
        from main import app  # noqa: F401
    except ImportError:
        pass
