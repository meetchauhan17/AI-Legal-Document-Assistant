"""
AI Legal Document Assistant — Hugging Face Space Entrypoint
Mounts the FastAPI backend onto Gradio for 100% free 24/7 hosting.
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

import gradio as gr
from main import app as fastapi_app

# Create a clean Gradio interface for status & documentation
with gr.Blocks(title="AI Legal Document Assistant API", theme=gr.themes.Soft()) as demo:
    gr.Markdown(
        """
        # ⚖️ AI Legal Document Assistant — Backend API
        
        **Status**: 🟢 Online & Running 24/7 on Hugging Face Spaces (16GB RAM)
        
        This Space hosts the FastAPI backend powering the Next.js web application.
        
        ### Quick Links
        - 📖 **Interactive API Documentation (Swagger)**: [/docs](/docs)
        - 📄 **Alternative Documentation (ReDoc)**: [/redoc](/redoc)
        - 🌐 **Frontend Application**: Connect via `NEXT_PUBLIC_API_URL`
        
        ### Active Endpoints
        - `POST /api/upload`: PDF extraction & parsing
        - `POST /api/upload-text`: Direct text indexing
        - `POST /api/simplify`: Plain-English translation & key points
        - `POST /api/analyze-risk`: Red-flag risk classification (Standard / Attention / Risk)
        - `POST /api/ask`: Grounded RAG question answering with clause citations
        - `POST /api/compare`: Dual contract comparative analysis
        - `POST /api/checklist`: Pre-signing negotiation checklist
        """
    )

# Mount the FastAPI backend onto the Gradio Space
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
