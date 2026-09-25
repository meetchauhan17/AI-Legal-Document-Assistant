import re
import json
from typing import Dict, Any, List, Optional
from groq import Groq

from backend.core.config import GROQ_API_KEY, GROQ_MODEL

LANGUAGE_INSTRUCTIONS = {
    "en": "Respond in English.",
    "hi": "Write all 'note' fields and 'overall_summary' in Hindi (Devanagari script). Keep 'aspect', 'document_a_value', 'document_b_value', 'more_favorable' in English.",
    "gu": "Write all 'note' fields and 'overall_summary' in Gujarati (Gujarati script). Keep 'aspect', 'document_a_value', 'document_b_value', 'more_favorable' in English."
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

def _extract_value(text: str, *patterns: str, default: str = "Not specified") -> str:
    """Extract first matching pattern value from text."""
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            return m.group(1).strip()
    return default

def _fallback_compare(text_a: str, text_b: str, language: str) -> Dict[str, Any]:
    """Rule-based fallback comparison when Groq is not configured."""
    points = []

    # Monthly Rent
    rent_a = _extract_value(text_a, r'monthly rent of \$?([\d,]+)', r'rent.*?\$?([\d,]+)')
    rent_b = _extract_value(text_b, r'monthly rent of \$?([\d,]+)', r'rent.*?\$?([\d,]+)')
    if rent_a != rent_b and rent_a != "Not specified" and rent_b != "Not specified":
        try:
            a_val = float(rent_a.replace(",", ""))
            b_val = float(rent_b.replace(",", ""))
            favorable = "a" if a_val < b_val else "b"
        except ValueError:
            favorable = "neutral"
        points.append({
            "aspect": "Monthly Rent",
            "document_a_value": f"${rent_a}",
            "document_b_value": f"${rent_b}",
            "more_favorable": favorable,
            "note": "The document with the lower rent is more cost-effective for the tenant."
        })

    # Security Deposit
    dep_a = _extract_value(text_a, r'deposit.*?\$?([\d,]+)', r'security.*?\$?([\d,]+)')
    dep_b = _extract_value(text_b, r'deposit.*?\$?([\d,]+)', r'security.*?\$?([\d,]+)')
    if dep_a != dep_b and dep_a != "Not specified" and dep_b != "Not specified":
        try:
            a_val = float(dep_a.replace(",", ""))
            b_val = float(dep_b.replace(",", ""))
            favorable = "a" if a_val < b_val else "b"
        except ValueError:
            favorable = "neutral"
        points.append({
            "aspect": "Security Deposit",
            "document_a_value": f"${dep_a}",
            "document_b_value": f"${dep_b}",
            "more_favorable": favorable,
            "note": "Lower security deposit reduces upfront financial burden for the tenant."
        })

    # Late Fee
    late_a = _extract_value(text_a, r'late (?:charge|fee|penalty).*?\$?([\d,]+)')
    late_b = _extract_value(text_b, r'late (?:charge|fee|penalty).*?\$?([\d,]+)')
    if late_a != "Not specified" or late_b != "Not specified":
        try:
            a_val = float(late_a.replace(",", "")) if late_a != "Not specified" else 9999
            b_val = float(late_b.replace(",", "")) if late_b != "Not specified" else 9999
            favorable = "a" if a_val < b_val else ("b" if b_val < a_val else "neutral")
        except ValueError:
            favorable = "neutral"
        points.append({
            "aspect": "Late Payment Fee",
            "document_a_value": f"${late_a}" if late_a != "Not specified" else "Not specified",
            "document_b_value": f"${late_b}" if late_b != "Not specified" else "Not specified",
            "more_favorable": favorable,
            "note": "Lower late fees are more lenient for the tenant on missed payments."
        })

    # Governing Law
    law_a = _extract_value(text_a, r'laws of (?:the )?(?:State of )?([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)')
    law_b = _extract_value(text_b, r'laws of (?:the )?(?:State of )?([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)')
    if law_a != law_b:
        points.append({
            "aspect": "Governing Law",
            "document_a_value": law_a,
            "document_b_value": law_b,
            "more_favorable": "neutral",
            "note": "Jurisdiction differences may affect which remedies and protections are available."
        })

    # Deposit forfeiture clause
    forfeit_a = "Yes" if re.search(r'forfeit|non-refundable|waives all rights', text_a, re.I) else "No"
    forfeit_b = "Yes" if re.search(r'forfeit|non-refundable|waives all rights', text_b, re.I) else "No"
    if forfeit_a != forfeit_b:
        favorable = "b" if forfeit_a == "Yes" else "a"
        points.append({
            "aspect": "Unilateral Deposit Forfeiture Clause",
            "document_a_value": forfeit_a,
            "document_b_value": forfeit_b,
            "more_favorable": favorable,
            "note": "A deposit forfeiture clause without due process is generally disadvantageous for tenants."
        })

    # Immediate eviction clause
    evict_a = "Yes" if re.search(r'immediate eviction|24 hours|without notice', text_a, re.I) else "No"
    evict_b = "Yes" if re.search(r'immediate eviction|24 hours|without notice', text_b, re.I) else "No"
    if evict_a != evict_b:
        favorable = "b" if evict_a == "Yes" else "a"
        points.append({
            "aspect": "Immediate Eviction Without Notice",
            "document_a_value": evict_a,
            "document_b_value": evict_b,
            "more_favorable": favorable,
            "note": "Standard practice requires advance written notice before eviction proceedings."
        })

    if not points:
        points = [{
            "aspect": "General Terms",
            "document_a_value": "Standard provisions",
            "document_b_value": "Standard provisions",
            "more_favorable": "neutral",
            "note": "Both documents appear to contain standard legal provisions."
        }]

    summary = (
        f"Document A and Document B were compared across {len(points)} key dimensions. "
        "Significant differences were found in financial obligations and risk-allocation clauses. "
        "Review each comparison point to determine which document is more suitable for your specific circumstances."
    )

    return {"comparison_points": points, "overall_summary": summary}

def compare_documents(text_a: str, text_b: str, language: str = "en") -> Dict[str, Any]:
    """
    Sends both documents to Groq to identify key differences across amounts, durations,
    penalties, and clauses. Indicates which is more favorable per dimension.

    Returns: {
        "comparison_points": [{"aspect", "document_a_value", "document_b_value",
                               "more_favorable": "a"|"b"|"neutral", "note"}],
        "overall_summary": "2-3 sentences"
    }
    """
    lang = language.lower() if language.lower() in LANGUAGE_INSTRUCTIONS else "en"
    lang_instruction = LANGUAGE_INSTRUCTIONS[lang]

    client = _get_groq_client()
    if not client:
        return _fallback_compare(text_a, text_b, lang)

    system_prompt = (
        "You are an expert contract comparison analyst.\n"
        "You will receive two legal documents labeled 'DOCUMENT A' and 'DOCUMENT B'.\n"
        "Your task is to identify all meaningful differences between them across these dimensions:\n"
        "- Financial amounts (rent, deposits, fees, penalties, caps)\n"
        "- Time durations (lease term, notice periods, grace periods, renewal windows)\n"
        "- Clauses present in one but absent in the other\n"
        "- Risk allocation (indemnification, liability, forfeiture, eviction procedures)\n"
        "- Governing law and jurisdiction\n\n"
        "For each difference, indicate 'more_favorable': 'a' (if Document A is better for the signing party), "
        "'b' (if Document B is better), or 'neutral' (if equal or contextual).\n\n"
        "Rules:\n"
        "1. Only identify REAL differences — do not invent differences that don't exist.\n"
        "2. NEVER issue legal verdicts. Use phrasing like 'this may be worth clarifying because...'.\n"
        f"3. {lang_instruction}\n"
        "4. Respond ONLY in valid JSON matching this exact schema:\n"
        "{\n"
        '  "comparison_points": [\n'
        '    {\n'
        '      "aspect": "Concise aspect name in English",\n'
        '      "document_a_value": "Value or clause from Document A",\n'
        '      "document_b_value": "Value or clause from Document B",\n'
        '      "more_favorable": "a" | "b" | "neutral",\n'
        '      "note": "Plain language explanation of the difference"\n'
        '    }\n'
        "  ],\n"
        '  "overall_summary": "2-3 sentence summary of the overall comparison"\n'
        "}"
    )

    # Truncate if combined text is very long (Groq context limit safety)
    max_chars_each = 6000
    a_truncated = text_a[:max_chars_each]
    b_truncated = text_b[:max_chars_each]

    user_prompt = (
        f"DOCUMENT A:\n{a_truncated}\n\n"
        f"---\n\n"
        f"DOCUMENT B:\n{b_truncated}\n\n"
        "Identify all key differences and output them in the specified JSON format:"
    )

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"},
            max_tokens=3000,
        )
        data = _clean_json(response.choices[0].message.content)

        if "comparison_points" not in data or not isinstance(data["comparison_points"], list):
            raise ValueError("Invalid response schema.")

        # Normalize more_favorable to strict a/b/neutral
        for pt in data["comparison_points"]:
            val = str(pt.get("more_favorable", "neutral")).lower().strip()
            if val in ("a", "document a", "doc a"):
                pt["more_favorable"] = "a"
            elif val in ("b", "document b", "doc b"):
                pt["more_favorable"] = "b"
            else:
                pt["more_favorable"] = "neutral"

        return data

    except Exception:
        return _fallback_compare(text_a, text_b, lang)
