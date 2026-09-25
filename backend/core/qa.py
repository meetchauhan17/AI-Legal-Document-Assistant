import re
import json
from typing import Dict, Any, List, Optional, Tuple
from groq import Groq

from backend.core.config import GROQ_API_KEY, GROQ_MODEL
from backend.core.rag import retrieve_relevant_chunks, session_collections, chroma_client

# Similarity threshold: ChromaDB cosine distance below this = poor match
# ChromaDB cosine distance: 0 = identical, 2 = opposite. 
# Cosine distance for MiniLM on QA sentence pairs typically ranges 0.3-0.8 for strong matches, 0.8-1.1 for broad matches.
SIMILARITY_THRESHOLD = 1.20

LANGUAGE_INSTRUCTIONS = {
    "en": "Respond in English.",
    "hi": "Respond entirely in Hindi (Devanagari script). Keep field names (answer, source_excerpt, confidence) in English.",
    "gu": "Respond entirely in Gujarati (Gujarati script). Keep field names (answer, source_excerpt, confidence) in English."
}

NOT_FOUND_MESSAGES = {
    "en": "This document doesn't appear to address that.",
    "hi": "यह दस्तावेज़ इस विषय पर कोई जानकारी नहीं देता।",
    "gu": "આ દસ્તાવેજ આ બાબત વિશે કોઈ માહિતી આપતો નથી."
}

def _get_groq_client() -> Optional[Groq]:
    if GROQ_API_KEY:
        return Groq(api_key=GROQ_API_KEY, timeout=20.0)
    return None

def _clean_json(raw: str) -> Dict[str, Any]:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return json.loads(text.strip())

def _get_chunks_with_distances(
    document_id: str,
    query: str,
    top_k: int = 4
) -> Tuple[List[str], List[float]]:
    """
    Returns (chunks, distances). Distances are ChromaDB cosine distances (lower = better match).
    Falls back to full text retrieval if no collection exists.
    """
    if document_id not in session_collections:
        return [], []

    collection = session_collections[document_id]
    count = collection.count()
    if count == 0:
        return [], []

    limit = min(top_k, count)
    results = collection.query(
        query_texts=[query],
        n_results=limit,
        include=["documents", "distances"]
    )

    docs = results.get("documents", [[]])[0]
    distances = results.get("distances", [[]])[0]
    return docs, distances

def _determine_confidence(distances: List[float]) -> str:
    """Map ChromaDB cosine distance to confidence tier."""
    if not distances:
        return "low"
    best = distances[0]
    if best < 0.60:
        return "high"
    elif best < 0.90:
        return "medium"
    else:
        return "low"

def _fallback_answer(question: str, chunks: List[str], language: str) -> Dict[str, Any]:
    """Keyword-matching fallback when Groq is not configured."""
    stop_words = {"what", "is", "the", "how", "much", "are", "does", "do", "when", "who", "a", "an", "and", "or", "for", "to", "in", "of", "on", "by", "any", "this", "that", "there", "it"}
    q_words = set(re.findall(r'\b\w+\b', question.lower()))
    q_content_words = q_words - stop_words

    not_found = NOT_FOUND_MESSAGES.get(language, NOT_FOUND_MESSAGES["en"])

    if not q_content_words:
        return {"answer": not_found, "source_excerpt": "", "confidence": "low"}

    best_chunk = ""
    best_score = 0

    for chunk in chunks:
        c_words = set(re.findall(r'\b\w+\b', chunk.lower()))
        overlap = len(q_content_words & c_words)
        if overlap > best_score:
            best_score = overlap
            best_chunk = chunk

    # If no meaningful keyword overlap, return not found
    if not best_chunk or best_score < 1:
        return {
            "answer": not_found,
            "source_excerpt": "",
            "confidence": "low"
        }

    # Find the most relevant sentence or clause
    sentences = [s.strip() for s in re.split(r'(?<=[.!?\n])\s+', best_chunk) if s.strip()]
    best_sentence = best_chunk[:300]
    best_sent_score = 0
    for sent in sentences:
        s_words = set(re.findall(r'\b\w+\b', sent.lower()))
        score = len(q_content_words & s_words)
        if score > best_sent_score:
            best_sent_score = score
            best_sentence = sent

    if best_sent_score < 1:
        return {
            "answer": not_found,
            "source_excerpt": "",
            "confidence": "low"
        }

    if language == "hi":
        answer = f"दस्तावेज़ के अनुसार: {best_sentence.strip()}"
    elif language == "gu":
        answer = f"દસ્તાવેજ મુજબ: {best_sentence.strip()}"
    else:
        answer = f"Based on the document: {best_sentence.strip()}"

    return {
        "answer": answer,
        "source_excerpt": best_chunk[:500],
        "confidence": "high" if best_sent_score >= 3 else ("medium" if best_sent_score >= 2 else "low")
    }

def answer_document_question(
    document_id: str,
    question: str,
    language: str = "en"
) -> Dict[str, Any]:
    """
    Retrieves top-4 relevant chunks via ChromaDB, applies a similarity threshold check,
    then asks Groq to answer ONLY from those excerpts.

    Similarity threshold gate:
      - If best ChromaDB cosine distance >= SIMILARITY_THRESHOLD (0.75), skip Groq and return
        the 'not found' response directly without an LLM call.

    Returns: {"answer": str, "source_excerpt": str, "confidence": "high|medium|low"}
    """
    lang = language.lower() if language.lower() in LANGUAGE_INSTRUCTIONS else "en"
    not_found_msg = NOT_FOUND_MESSAGES[lang]

    # 1. Retrieve chunks + distances from ChromaDB
    chunks, distances = _get_chunks_with_distances(document_id, question, top_k=4)

    if not chunks:
        return {
            "answer": not_found_msg,
            "source_excerpt": "",
            "confidence": "low"
        }

    # 2. Similarity threshold gate — skip LLM if no chunk is relevant enough
    best_distance = distances[0] if distances else 1.0
    if best_distance >= SIMILARITY_THRESHOLD:
        return {
            "answer": not_found_msg,
            "source_excerpt": "",
            "confidence": "low"
        }

    # 3. Determine confidence from distance scores
    confidence = _determine_confidence(distances)

    # 4. Build context from retrieved chunks
    context_blocks = [f"[Excerpt {i+1}]:\n{chunk}" for i, chunk in enumerate(chunks)]
    context_str = "\n\n".join(context_blocks)

    # 5. Groq call or fallback
    client = _get_groq_client()
    if not client:
        return _fallback_answer(question, chunks, lang)

    lang_instruction = LANGUAGE_INSTRUCTIONS[lang]
    system_prompt = (
        "You are a precise legal document question-answering assistant.\n"
        "You MUST answer based ONLY on the document excerpts provided. Do NOT draw on outside knowledge.\n"
        "If the answer is not contained in the provided excerpts, respond with:\n"
        f"\"{not_found_msg}\"\n\n"
        "Rules:\n"
        "1. Quote or closely paraphrase the most relevant excerpt in your answer.\n"
        "2. NEVER make up figures, dates, or parties not mentioned in the excerpts.\n"
        f"3. {lang_instruction}\n"
        "4. Respond ONLY in valid JSON with these exact keys:\n"
        "{\n"
        '  "answer": "Your concise, grounded answer",\n'
        '  "source_excerpt": "The exact excerpt you based your answer on"\n'
        "}"
    )

    user_prompt = (
        f"Document Excerpts:\n\n{context_str}\n\n"
        f"Question: {question}\n\n"
        "Answer strictly from the excerpts above in JSON:"
    )

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"},
            max_tokens=1024,
        )
        data = _clean_json(response.choices[0].message.content)
        answer_text = data.get("answer", not_found_msg)
        source = data.get("source_excerpt", chunks[0][:400] if chunks else "")

        # If model couldn't find the answer in context, downgrade confidence
        if answer_text.strip() == not_found_msg or not answer_text.strip():
            confidence = "low"

        return {
            "answer": answer_text,
            "source_excerpt": source,
            "confidence": confidence
        }
    except Exception:
        return _fallback_answer(question, chunks, lang)
