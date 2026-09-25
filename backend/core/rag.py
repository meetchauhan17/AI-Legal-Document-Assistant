import re
from typing import List, Dict, Any, Optional
from collections import OrderedDict

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from groq import Groq
from backend.core.config import GROQ_API_KEY, GROQ_MODEL

# In-memory ChromaDB client (strictly Ephemeral/in-memory, NEVER PersistentClient)
chroma_client = chromadb.Client()

# Shared sentence-transformers embedding function (all-MiniLM-L6-v2)
embedding_function = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

# In-memory dict keyed by document_id with a maximum 20-session limit
MAX_SESSIONS = 20
session_collections: OrderedDict[str, Any] = OrderedDict()

def split_into_segments(text: str) -> List[str]:
    """Split text on paragraph and sentence boundaries while preserving structure."""
    paragraphs = re.split(r'(\n\s*\n+)', text)
    segments = []
    for para in paragraphs:
        if not para.strip():
            continue
        # Split paragraph into sentences on period/question/exclamation followed by space or newline
        sentences = re.split(r'(?<=[.!?])\s+', para)
        for s in sentences:
            s_clean = s.strip()
            if s_clean:
                segments.append(s_clean)
    return segments

def chunk_document(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Splits text into chunks of roughly chunk_size characters with overlap,
    prioritizing paragraph and sentence boundaries where possible.
    """
    if not text or not text.strip():
        return []

    text = text.strip()
    if len(text) <= chunk_size:
        return [text]

    segments = split_into_segments(text)
    if not segments:
        return [text]

    chunks = []
    current_chunk: List[str] = []
    current_len = 0

    for seg in segments:
        seg_len = len(seg)

        # If adding this segment exceeds chunk_size, finalize current chunk
        if current_chunk and (current_len + 1 + seg_len > chunk_size):
            chunk_str = " ".join(current_chunk).strip()
            if chunk_str:
                chunks.append(chunk_str)

            # Build overlap from the tail of current_chunk
            overlap_segments: List[str] = []
            overlap_len = 0
            for prev_seg in reversed(current_chunk):
                if overlap_len + len(prev_seg) + 1 <= overlap:
                    overlap_segments.insert(0, prev_seg)
                    overlap_len += len(prev_seg) + 1
                else:
                    break

            current_chunk = overlap_segments
            current_len = sum(len(s) for s in current_chunk) + max(0, len(current_chunk) - 1)

        # If a single segment is longer than chunk_size, split by words
        if seg_len > chunk_size:
            words = seg.split()
            word_chunk: List[str] = []
            word_len = 0
            for w in words:
                if word_chunk and (word_len + 1 + len(w) > chunk_size):
                    w_str = " ".join(word_chunk).strip()
                    if w_str:
                        chunks.append(w_str)
                    overlap_words: List[str] = []
                    o_len = 0
                    for pw in reversed(word_chunk):
                        if o_len + len(pw) + 1 <= overlap:
                            overlap_words.insert(0, pw)
                            o_len += len(pw) + 1
                        else:
                            break
                    word_chunk = overlap_words
                    word_len = sum(len(pw) for pw in word_chunk) + max(0, len(word_chunk) - 1)
                word_chunk.append(w)
                word_len += len(w) + 1

            if word_chunk:
                current_chunk.extend(word_chunk)
                current_len += word_len
        else:
            current_chunk.append(seg)
            current_len += seg_len + 1

    if current_chunk:
        final_str = " ".join(current_chunk).strip()
        if final_str and (not chunks or chunks[-1] != final_str):
            chunks.append(final_str)

    return chunks

def create_session_collection(document_id: str, chunks: List[str]) -> Any:
    """
    Creates an in-memory session collection in ChromaDB embedded with sentence-transformers.
    Stores the collection in session_collections keyed by document_id.
    Enforces the max 20-session limit by evicting the oldest session.
    """
    # If session already exists, delete previous Chroma collection
    if document_id in session_collections:
        old_col = session_collections.pop(document_id)
        try:
            chroma_client.delete_collection(old_col.name)
        except Exception:
            pass

    # Evict oldest session(s) if at or above MAX_SESSIONS
    while len(session_collections) >= MAX_SESSIONS:
        oldest_id, oldest_col = session_collections.popitem(last=False)
        try:
            chroma_client.delete_collection(oldest_col.name)
        except Exception:
            pass

    # Sanitize collection name for Chroma requirements (3-63 chars, alphanumeric/underscore)
    sanitized_id = re.sub(r'[^a-zA-Z0-9_]', '_', document_id)
    collection_name = f"col_{sanitized_id}"[:60]

    try:
        chroma_client.delete_collection(collection_name)
    except Exception:
        pass

    collection = chroma_client.create_collection(
        name=collection_name,
        embedding_function=embedding_function,
        metadata={"document_id": document_id, "hnsw:space": "cosine"}
    )

    if chunks:
        ids = [f"{document_id}_{i}" for i in range(len(chunks))]
        metadatas = [{"document_id": document_id, "chunk_index": i} for i in range(len(chunks))]
        collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )

    # Store in memory dict keyed by document_id
    session_collections[document_id] = collection
    return collection

def retrieve_relevant_chunks(document_id: str, query: str, top_k: int = 4) -> List[str]:
    """
    Retrieves the top_k relevant chunk texts for document_id from the in-memory collection.
    """
    if document_id not in session_collections:
        return []

    collection = session_collections[document_id]
    count = collection.count()
    if count == 0:
        return []

    limit = min(top_k, count)
    results = collection.query(
        query_texts=[query],
        n_results=limit
    )

    docs = results.get("documents", [[]])
    return docs[0] if docs else []

class RAGPipeline:
    """RAG pipeline integrating in-memory ChromaDB retrieval with Groq LLaMA-3.3-70b-versatile."""

    def __init__(self):
        self._client: Optional[Groq] = None

    @property
    def client(self) -> Optional[Groq]:
        if self._client is None and GROQ_API_KEY:
            self._client = Groq(api_key=GROQ_API_KEY, timeout=20.0)
        return self._client

    def answer_query(self, query: str, document_id: Optional[str] = None, n_results: int = 4) -> Dict[str, Any]:
        """
        Retrieve context from the document's session collection and generate an answer using Groq.
        """
        # Select target document session (given document_id or most recent session)
        target_doc_id = document_id
        if not target_doc_id and session_collections:
            target_doc_id = next(reversed(session_collections))

        chunks: List[str] = []
        if target_doc_id:
            chunks = retrieve_relevant_chunks(target_doc_id, query, top_k=n_results)

        context_blocks = [f"[Excerpt {i+1}]:\n{chunk}" for i, chunk in enumerate(chunks)]
        context_str = "\n\n".join(context_blocks) if context_blocks else "No relevant document excerpts found."

        if not self.client:
            return {
                "answer": "Groq API key is not configured. Please set GROQ_API_KEY in your .env file to enable LLaMA-3.3-70b-versatile responses.",
                "model": GROQ_MODEL,
                "document_id": target_doc_id,
                "context_used": chunks,
                "api_key_configured": False
            }

        system_prompt = (
            "You are an expert AI Legal Document Assistant. Your role is to analyze legal agreements, "
            "contracts, statutes, and documents with high precision, clear legal reasoning, and direct citations.\n"
            "Answer the user's question based strictly on the provided context excerpts when available. "
            "If the excerpts do not contain the answer, explicitly state that the document does not contain "
            "this information. Always maintain an objective, professional tone."
        )

        user_prompt = (
            f"Context Excerpts from Legal Document:\n{context_str}\n\n"
            f"User Question:\n{query}\n\n"
            f"Provide a clear, detailed, and structured legal analysis answering the question:"
        )

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=GROQ_MODEL,
                temperature=0.2,
                max_tokens=2048,
            )
            answer = chat_completion.choices[0].message.content
            return {
                "answer": answer,
                "model": GROQ_MODEL,
                "document_id": target_doc_id,
                "context_used": chunks,
                "api_key_configured": True
            }
        except Exception as e:
            return {
                "answer": f"Error calling Groq API: {str(e)}",
                "model": GROQ_MODEL,
                "document_id": target_doc_id,
                "context_used": chunks,
                "api_key_configured": True,
                "error": str(e)
            }

rag_pipeline = RAGPipeline()
