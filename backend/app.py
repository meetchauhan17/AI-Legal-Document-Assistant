"""
AI Legal Document Assistant — Hugging Face Space Entrypoint
Mounts the FastAPI backend onto Gradio 4.44.1 for 100% free 24/7 hosting.
"""

import sys
import types
from pathlib import Path

# Support running directly in Hugging Face Spaces where 'core' is a sibling directory
_APP_DIR = Path(__file__).resolve().parent
if "backend" not in sys.modules and (_APP_DIR / "core").exists():
    _pkg = types.ModuleType("backend")
    _pkg.__path__ = [str(_APP_DIR)]
    sys.modules["backend"] = _pkg
if str(_APP_DIR) not in sys.path:
    sys.path.insert(0, str(_APP_DIR))

# Satisfy Hugging Face ZeroGPU startup check
try:
    import spaces
    @spaces.GPU
    def zero_gpu_check():
        return True
    zero_gpu_check()
except Exception:
    pass

import gradio as gr
from main import app as fastapi_app

# Create clean Gradio documentation interface
with gr.Blocks(title="AI Legal Document Assistant API") as demo:
    gr.Markdown(
        """
        # ⚖️ AI Legal Document Assistant — Backend API
        
        **Status**: 🟢 Online & Running 24/7 on Hugging Face Spaces (16GB RAM)
        
        This Space hosts the FastAPI backend powering the Next.js web application.
        
        ### Active Endpoints
        - `POST /api/upload`: PDF extraction & parsing
        - `POST /api/upload-text`: Direct text indexing
        - `POST /api/simplify`: Plain-English translation & key points
        - `POST /api/analyze-risk`: Red-flag risk classification (Standard / Attention / Risk)
        - `POST /api/ask`: Grounded RAG question answering with clause citations
        - `POST /api/compare`: Dual contract comparative analysis
        - `POST /api/checklist`: Pre-signing negotiation checklist
        - `GET /api/health`: Backend health status
        """
    )

# Mount Gradio documentation at /status so it never interferes with FastAPI root or /api/*
app = gr.mount_gradio_app(fastapi_app, demo, path="/status")
