import uuid
from typing import Optional, List, Dict, Any
from collections import OrderedDict
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.core.config import CORS_ORIGINS, GROQ_MODEL, GROQ_API_KEY, UPLOADS_DIR
from backend.core.extract import extract_pdf_data, SCANNED_DOC_MESSAGE
from backend.core.rag import (
    chunk_document,
    create_session_collection,
    retrieve_relevant_chunks,
    session_collections,
    rag_pipeline,
)
from backend.core.simplify import simplify_document
from backend.core.risk_analysis import analyze_clauses
from backend.core.qa import answer_document_question
from backend.core.compare import compare_documents
from backend.core.checklist import generate_checklist

app = FastAPI(
    title="Legal Document Assistant API",
    description="Backend API with ChromaDB in-memory RAG, Groq llama-3.3-70b-versatile, document simplification, and risk analysis",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB limit
MAX_SESSIONS = 20

# In-memory session document store for full text lookup
session_documents: OrderedDict[str, str] = OrderedDict()

def store_session_document(doc_id: str, text: str):
    """Store document text in memory with max 20 session eviction."""
    while len(session_documents) >= MAX_SESSIONS:
        session_documents.popitem(last=False)
    session_documents[doc_id] = text

class QueryRequest(BaseModel):
    query: str
    document_id: Optional[str] = None
    top_k: int = 4

class TextUploadRequest(BaseModel):
    text: str

class RetrieveRequest(BaseModel):
    document_id: str
    query: str
    top_k: int = 4

class AnalysisRequest(BaseModel):
    document_id: Optional[str] = None
    full_text: Optional[str] = None
    language: str = "en"

class QARequest(BaseModel):
    document_id: str
    question: str
    language: str = "en"

class CompareRequest(BaseModel):
    text_a: str
    text_b: str
    language: str = "en"

class ChecklistRequest(BaseModel):
    document_id: Optional[str] = None
    full_text: Optional[str] = None
    risk_clauses: List[Dict[str, Any]] = []
    language: str = "en"

@app.get("/")
def root():
    return {
        "service": "Legal Document Assistant Backend",
        "status": "online",
        "vector_db": "ChromaDB (In-Memory Ephemeral)",
        "active_sessions": len(session_collections),
        "model": GROQ_MODEL
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "active_sessions": len(session_collections),
        "stored_documents": len(session_documents),
        "groq_configured": bool(GROQ_API_KEY),
        "groq_model": GROQ_MODEL
    }

@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Accepts multipart PDF upload only.
    Rejects non-PDFs and files over 5MB.
    Saves temporarily to /backend/uploads/{uuid}.pdf, extracts text with pdfplumber,
    and IMMEDIATELY deletes the temp file.
    Automatically chunks and indexes the document into in-memory ChromaDB.
    Returns: {"document_id": uuid, "text_preview": first 500 chars, "full_text": complete text, "page_count": number}
    """
    # 1. Validate file extension
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # 2. Validate MIME content-type if provided
    if file.content_type and file.content_type not in ["application/pdf", "application/x-pdf", "application/octet-stream"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF documents are accepted.")

    doc_id = str(uuid.uuid4())
    temp_file_path = UPLOADS_DIR / f"{doc_id}.pdf"
    total_size = 0

    try:
        # 3. Stream and enforce 5MB size limit
        with open(temp_file_path, "wb") as buffer:
            while chunk := await file.read(65536):
                total_size += len(chunk)
                if total_size > MAX_FILE_SIZE_BYTES:
                    raise HTTPException(
                        status_code=400,
                        detail="File size exceeds maximum allowed limit of 5MB."
                    )
                buffer.write(chunk)

        # 4. Extract text and page count using pdfplumber
        try:
            full_text, page_count = extract_pdf_data(str(temp_file_path))
        except Exception as extract_err:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to extract text from PDF: {str(extract_err)}"
            )

        # 5. Automatically chunk + index the document right after extraction
        if full_text and full_text != SCANNED_DOC_MESSAGE:
            chunks = chunk_document(full_text)
            if chunks:
                create_session_collection(doc_id, chunks)
            store_session_document(doc_id, full_text)

        # 6. Return response matching exact schema
        return {
            "document_id": doc_id,
            "text_preview": full_text[:500],
            "full_text": full_text,
            "page_count": page_count,
        }

    finally:
        # IMMEDIATELY delete temporary file
        if temp_file_path.exists():
            try:
                temp_file_path.unlink()
            except Exception:
                pass

@app.post("/api/upload-text")
def upload_text(payload: TextUploadRequest):
    """
    Accepts pasted raw text as an alternative to file upload.
    Automatically chunks and indexes the document into in-memory ChromaDB.
    Returns: {"document_id": uuid, "text_preview": first 500 chars, "full_text": complete text, "page_count": 1}
    """
    raw_text = payload.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Pasted text cannot be empty.")

    if len(raw_text.encode("utf-8")) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Text size exceeds maximum allowed limit of 5MB.")

    doc_id = str(uuid.uuid4())

    # Automatically chunk + index the document right after extraction
    chunks = chunk_document(raw_text)
    if chunks:
        create_session_collection(doc_id, chunks)
    store_session_document(doc_id, raw_text)

    return {
        "document_id": doc_id,
        "text_preview": raw_text[:500],
        "full_text": raw_text,
        "page_count": 1,
    }

@app.post("/api/retrieve")
def retrieve_chunks_endpoint(payload: RetrieveRequest):
    """
    Retrieve relevant chunks for a specific document session.
    """
    chunks = retrieve_relevant_chunks(payload.document_id, payload.query, top_k=payload.top_k)
    return {
        "document_id": payload.document_id,
        "query": payload.query,
        "chunks": chunks,
        "count": len(chunks)
    }

@app.post("/api/simplify")
def simplify_endpoint(request: AnalysisRequest):
    """
    Rewrites document into plain language, preserving all obligations, deadlines, and amounts.
    Returns JSON: {"document_type": "...", "plain_summary": "2-3 paragraphs", "key_points": ["5-8 points"]}
    Supports language="en"|"hi"|"gu".
    """
    text = (request.full_text or "").strip()
    if not text and request.document_id and request.document_id in session_documents:
        text = session_documents[request.document_id]

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Either 'full_text' or a valid active 'document_id' must be provided."
        )

    lang = request.language.lower() if request.language in ["en", "hi", "gu"] else "en"
    result = simplify_document(full_text=text, language=lang)
    return {
        "document_id": request.document_id,
        "language": lang,
        **result
    }

@app.post("/api/analyze-risk")
def analyze_risk_endpoint(request: AnalysisRequest):
    """
    Identifies 10-15 significant clauses and classifies each as 'standard'/'attention'/'risk'.
    Returns JSON: {"clauses": [{"clause_text": "...", "category": "...", "severity": "...", "explanation": "..."}]}
    Supports language="en"|"hi"|"gu".
    """
    text = (request.full_text or "").strip()
    if not text and request.document_id and request.document_id in session_documents:
        text = session_documents[request.document_id]

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Either 'full_text' or a valid active 'document_id' must be provided."
        )

    lang = request.language.lower() if request.language in ["en", "hi", "gu"] else "en"
    result = analyze_clauses(full_text=text, language=lang)
    return {
        "document_id": request.document_id,
        "language": lang,
        **result
    }

@app.post("/api/ask")
def ask_question(request: QARequest):
    """
    Answer a factual question about a specific uploaded document.
    Retrieves top-4 relevant chunks via ChromaDB with similarity threshold gate.
    Returns {"answer": str, "source_excerpt": str, "confidence": "high|medium|low"}.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    lang = request.language.lower() if request.language.lower() in ["en", "hi", "gu"] else "en"
    result = answer_document_question(
        document_id=request.document_id,
        question=request.question,
        language=lang
    )
    return {
        "document_id": request.document_id,
        "question": request.question,
        "language": lang,
        **result
    }

@app.post("/api/compare")
def compare_endpoint(request: CompareRequest):
    """
    Compare two legal document texts and identify key differences.
    Returns {"comparison_points": [...], "overall_summary": "..."}
    """
    if not request.text_a.strip() or not request.text_b.strip():
        raise HTTPException(status_code=400, detail="Both text_a and text_b must be non-empty.")

    lang = request.language.lower() if request.language.lower() in ["en", "hi", "gu"] else "en"
    result = compare_documents(
        text_a=request.text_a,
        text_b=request.text_b,
        language=lang
    )
    return {
        "language": lang,
        **result
    }

@app.post("/api/checklist")
def checklist_endpoint(request: ChecklistRequest):
    """
    Generate a specific pre-signing checklist and lawyer-prep questions.
    Accepts previously identified risk_clauses for context-aware item generation.
    Returns {"before_signing_checklist": [...], "questions_to_ask": [...]}
    """
    lang = request.language.lower() if request.language.lower() in ["en", "hi", "gu"] else "en"

    # Resolve full_text from document_id if not provided directly
    text = request.full_text or ""
    if not text and request.document_id:
        text = session_documents.get(request.document_id, "")
    if not text:
        raise HTTPException(
            status_code=400,
            detail="Either full_text or a valid document_id with stored text is required."
        )

    result = generate_checklist(
        full_text=text,
        risk_clauses=request.risk_clauses,
        language=lang
    )
    return {
        "document_id": request.document_id,
        "language": lang,
        **result
    }


@app.post("/api/query")
def query_document(request: QueryRequest):
    """Query the indexed document with RAG using Groq LLaMA-3.3-70b-versatile."""
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    response = rag_pipeline.answer_query(
        query=request.query,
        document_id=request.document_id,
        n_results=request.top_k
    )
    return response

@app.post("/api/documents/reset")
def reset_vector_db():
    """Wipe the in-memory vector store sessions."""
    session_collections.clear()
    session_documents.clear()
    return {"message": "In-memory vector store sessions cleared."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
