import re
import json
from typing import Dict, Any, List, Optional
from groq import Groq

from backend.core.config import GROQ_API_KEY, GROQ_MODEL

LANGUAGE_INSTRUCTIONS = {
    "en": "Respond in English.",
    "hi": "Write all checklist items and questions in Hindi (Devanagari script). Keep JSON keys in English.",
    "gu": "Write all checklist items and questions in Gujarati (Gujarati script). Keep JSON keys in English."
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

# ── helpers for fallback ────────────────────────────────────────────────────

def _extract_section_refs(text: str) -> List[str]:
    """Find all section/clause headers in the document to reference them by name."""
    pattern = re.compile(
        r"(?:^|\n)\s*(\d+[\.\)]\s+[A-Z][A-Z\s\/&]{3,60}|"
        r"(?:SECTION|CLAUSE|ARTICLE)\s+\d+[^\n]{0,60})",
        re.MULTILINE | re.IGNORECASE
    )
    found = []
    for m in pattern.finditer(text):
        title = m.group(1).strip().rstrip(":")
        if title and title not in found:
            found.append(title)
    return found[:10]

def _extract_amounts(text: str) -> List[str]:
    """Find dollar/currency amounts and their context."""
    hits = []
    for m in re.finditer(r'\$[\d,]+(?:\.\d{2})?', text):
        start = max(0, m.start() - 40)
        end = min(len(text), m.end() + 40)
        ctx = text[start:end].replace("\n", " ").strip()
        hits.append((m.group(), ctx))
    return hits[:6]

def _extract_dates_durations(text: str) -> List[str]:
    """Find dates and time durations mentioned in the document."""
    hits = []
    date_pat = re.compile(
        r'(?:\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)'
        r'\s+\d{4}|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)'
        r'\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})',
        re.IGNORECASE
    )
    for m in date_pat.finditer(text):
        hits.append(m.group().strip())
    dur_pat = re.compile(r'\d+\s+(?:days?|months?|years?|weeks?)', re.IGNORECASE)
    for m in dur_pat.finditer(text):
        hits.append(m.group().strip())
    return list(dict.fromkeys(hits))[:6]  # deduplicate, keep order

def _make_checklist_from_risk_clauses(
    risk_clauses: List[Dict[str, Any]],
    sections: List[str],
    amounts: List,
    durations: List[str],
    language: str
) -> Dict[str, Any]:
    """
    Rule-based checklist generation referencing actual document content.
    Used when Groq is not configured.
    """
    checklist_items = []
    questions = []

    # Items from risk/attention clauses
    for clause in risk_clauses:
        cat = clause.get("category", "")
        text_excerpt = clause.get("clause_text", "")[:120].replace("\n", " ").strip()
        explanation = clause.get("explanation", "")
        severity = clause.get("category_level", clause.get("category", "")).lower()

        if "deposit" in cat.lower() or "deposit" in text_excerpt.lower():
            checklist_items.append(
                f"Clarify the exact conditions under which the security deposit can be withheld — "
                f"the document states: \"{text_excerpt[:80]}...\""
            )
            questions.append(
                "Under what specific, documented conditions will the security deposit be deducted or forfeited?"
            )

        elif "eviction" in cat.lower() or "entry" in cat.lower() or "notice" in text_excerpt.lower():
            checklist_items.append(
                f"Request written confirmation of the exact notice period required before any eviction or lockout — "
                f"current clause reads: \"{text_excerpt[:80]}...\""
            )
            questions.append(
                "What is the minimum written notice period required before the landlord can initiate eviction proceedings?"
            )

        elif "renewal" in cat.lower() or "auto" in text_excerpt.lower():
            checklist_items.append(
                f"Set a calendar reminder for the auto-renewal opt-out deadline — clause: \"{text_excerpt[:80]}...\""
            )
            questions.append(
                "How many days in advance must I notify you in writing to prevent automatic renewal of this agreement?"
            )

        elif "penalty" in cat.lower() or "fee" in cat.lower() or "late" in cat.lower():
            checklist_items.append(
                f"Understand the exact grace period and fee structure for late payments: \"{text_excerpt[:80]}...\""
            )
            questions.append(
                "Is there flexibility in the late payment grace period, and how are fees calculated?"
            )

        elif "liabilit" in cat.lower() or "indemni" in cat.lower():
            checklist_items.append(
                f"Have a lawyer review the liability/indemnification language: \"{text_excerpt[:80]}...\""
            )
            questions.append(
                "Can the liability clause be capped or modified to reflect mutual obligations?"
            )

        else:
            if explanation:
                checklist_items.append(
                    f"Review clause '{cat}' before signing — {explanation[:120]}"
                )

    # Items from extracted financial amounts
    for amount, ctx in amounts[:3]:
        if amount not in " ".join(checklist_items):
            checklist_items.append(
                f"Verify the {amount} figure and confirm it matches your verbal agreement: \"{ctx[:80]}\""
            )

    # Items from section references
    for sec in sections[:3]:
        if len(checklist_items) < 8:
            checklist_items.append(
                f"Read and confirm you understand the terms in '{sec}' before signing."
            )

    # Items from dates/durations
    for dur in durations[:2]:
        if dur not in " ".join(checklist_items) and len(checklist_items) < 8:
            checklist_items.append(
                f"Note the '{dur}' timeframe in the document and ensure it aligns with your plans."
            )

    # Generic but useful fallback items
    generic = [
        "Request a copy of any addenda, rules, or policies referenced but not included in this document.",
        "Ensure all blank fields in the agreement are filled in before you sign — never sign a document with blanks.",
        "Get all verbal promises from the other party added as written amendments before signing.",
        "Keep a signed copy of this agreement in a safe place for the full duration of the contract period.",
    ]
    for g in generic:
        if len(checklist_items) < 8:
            checklist_items.append(g)

    # Generic questions fallback
    generic_q = [
        "Can any of the one-sided clauses identified in this agreement be renegotiated before signing?",
        "What is the process for raising a dispute if either party believes the agreement has been breached?",
        "Are there any additional fees or charges not listed in this document that I should be aware of?",
    ]
    for q in generic_q:
        if len(questions) < 5:
            questions.append(q)

    return {
        "before_signing_checklist": checklist_items[:8],
        "questions_to_ask": questions[:5]
    }


# ── main public function ─────────────────────────────────────────────────────

def generate_checklist(
    full_text: str,
    risk_clauses: List[Dict[str, Any]],
    language: str = "en"
) -> Dict[str, Any]:
    """
    Generates a pre-signing checklist and lawyer-prep questions by sending the document
    text + previously identified risk/attention clauses to Groq.

    Each item MUST reference specific content from the actual document (amounts, section names,
    clause excerpts, dates) — generic boilerplate is explicitly prohibited in the prompt.

    Returns:
        {
            "before_signing_checklist": ["5-8 specific actionable items"],
            "questions_to_ask": ["3-5 specific questions referencing actual clauses"]
        }
    """
    lang = language.lower() if language.lower() in LANGUAGE_INSTRUCTIONS else "en"
    lang_instruction = LANGUAGE_INSTRUCTIONS[lang]

    # Pre-extract document structure for use by both Groq and fallback
    sections = _extract_section_refs(full_text)
    amounts = _extract_amounts(full_text)
    durations = _extract_dates_durations(full_text)

    client = _get_groq_client()
    if not client:
        return _make_checklist_from_risk_clauses(risk_clauses, sections, amounts, durations, lang)

    # Summarise risk clauses into a concise block for the prompt
    risk_summary_lines = []
    for c in risk_clauses:
        cat = c.get("category", "Unknown")
        severity = c.get("category_level", c.get("severity", "attention"))
        excerpt = c.get("clause_text", "")[:150].replace("\n", " ")
        explanation = c.get("explanation", "")[:200]
        risk_summary_lines.append(
            f"[{severity.upper()}] {cat}: \"{excerpt}\" — {explanation}"
        )
    risk_block = "\n".join(risk_summary_lines) if risk_summary_lines else "No specific risk clauses identified."

    # Truncate document for context
    doc_excerpt = full_text[:5000]

    system_prompt = (
        "You are an expert pre-signing legal document advisor.\n"
        "Your job is to generate a HIGHLY SPECIFIC pre-signing checklist and lawyer-prep questions "
        "based on the actual content of the provided document.\n\n"
        "CRITICAL RULES:\n"
        "1. Every checklist item MUST reference specific content from the document: "
        "quote exact dollar amounts, section names, clause titles, dates, or timeframes actually found in the text. "
        "NEVER write generic advice like 'Read the contract carefully' or 'Consult a lawyer' — "
        "those are already obvious. Instead: 'Confirm the $4,400 deposit refund timeline in Section 3'.\n"
        "2. Every question in 'questions_to_ask' MUST reference a specific clause, amount, or provision "
        "found in the document. Example: 'Under what circumstances can the landlord forfeit the full $4,400 "
        "deposit without an inspection report, as stated in Section 3?'\n"
        "3. NEVER issue legal verdicts. Do not say 'this clause is illegal'. "
        "Use phrasing like 'this may be worth clarifying before signing'.\n"
        f"4. {lang_instruction}\n"
        "5. Output ONLY valid JSON matching this exact schema:\n"
        "{\n"
        '  "before_signing_checklist": [\n'
        '    "Specific actionable item referencing actual document content",\n'
        '    ... (5 to 8 items total)\n'
        '  ],\n'
        '  "questions_to_ask": [\n'
        '    "Specific question referencing an actual clause or amount",\n'
        '    ... (3 to 5 questions total)\n'
        '  ]\n'
        "}"
    )

    user_prompt = (
        f"DOCUMENT TEXT (excerpt):\n{doc_excerpt}\n\n"
        f"---\n\n"
        f"IDENTIFIED RISK / ATTENTION CLAUSES:\n{risk_block}\n\n"
        f"DOCUMENT SECTIONS DETECTED: {', '.join(sections) if sections else 'N/A'}\n"
        f"KEY AMOUNTS FOUND: {', '.join(a[0] for a in amounts) if amounts else 'N/A'}\n"
        f"KEY DATES/DURATIONS: {', '.join(durations) if durations else 'N/A'}\n\n"
        "Generate the pre-signing checklist and questions referencing the specific content above:"
    )

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
            max_tokens=1500,
        )
        data = _clean_json(response.choices[0].message.content)

        checklist = data.get("before_signing_checklist", [])
        questions = data.get("questions_to_ask", [])

        if not isinstance(checklist, list) or len(checklist) < 3:
            raise ValueError("Insufficient checklist items from model.")
        if not isinstance(questions, list) or len(questions) < 2:
            raise ValueError("Insufficient questions from model.")

        return {
            "before_signing_checklist": checklist[:8],
            "questions_to_ask": questions[:5]
        }

    except Exception:
        return _make_checklist_from_risk_clauses(risk_clauses, sections, amounts, durations, lang)
