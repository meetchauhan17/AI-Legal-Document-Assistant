import json
import re
from typing import Dict, Any, List, Optional
from groq import Groq

from backend.core.config import GROQ_API_KEY, GROQ_MODEL

LANGUAGE_INSTRUCTIONS = {
    "en": "Write the 'explanation' field in English.",
    "hi": "Write the 'explanation' field in Hindi (Devanagari script). Keep 'severity' exactly as 'standard'|'attention'|'risk' and 'category' in English.",
    "gu": "Write the 'explanation' field in Gujarati (Gujarati script). Keep 'severity' exactly as 'standard'|'attention'|'risk' and 'category' in English."
}

def get_groq_client() -> Optional[Groq]:
    if GROQ_API_KEY:
        return Groq(api_key=GROQ_API_KEY, timeout=20.0)
    return None

def clean_json_response(raw_text: str) -> Dict[str, Any]:
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return json.loads(text.strip())

def fallback_analyze_clauses(full_text: str, language: str = "en") -> Dict[str, Any]:
    """
    Deterministic rule-based clause analysis fallback when Groq API key is not configured.
    Detects one-sided provisions, obligations, and boilerplate clauses.
    """
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n+', full_text) if len(p.strip()) > 30]
    classified_clauses = []

    # Risk markers for one-sided, disadvantageous, or unusual terms
    risk_patterns = [
        (r'forfeit.*deposit|deposit.*non-refundable|forfeiture', "Security Deposit",
         "This may be worth clarifying because the landlord or party retains the right to withhold the entire security deposit without an objective inspection or dispute resolution mechanism."),
        (r'without notice|immediate eviction|evict.*24 hours|enter.*any time', "Access & Eviction",
         "This may be worth clarifying because it grants unilateral access or termination rights without standard statutory notice periods."),
        (r'auto-renew|automatic renewal.*unless|without prior written notice', "Renewal Terms",
         "This may be worth clarifying because automatic renewal with short notice windows can inadvertently lock parties into subsequent terms."),
        (r'waive.*liability|sole liability|hold harmless.*all claims|unlimited indemnity', "Liability & Indemnity",
         "This may be worth clarifying because it imposes broad indemnification or unilateral liability shifts onto one party."),
        (r'penalty.*[0-9]{2}%|late fee.*exceed|50%|unreasonable penalty', "Financial Penalties",
         "This may be worth clarifying because late fee charges appear disproportionately high compared to standard legal practices.")
    ]

    # Attention markers
    attention_patterns = [
        (r'maintenance|repairs.*tenant|lessee shall repair', "Maintenance & Repairs",
         "This clause assigns substantial upkeep responsibilities that usually require clear cost caps."),
        (r'late fee|grace period|interest.*per month', "Payment Terms",
         "This clause specifies strict payment timing and interest charges for delayed remittance."),
        (r'alteration|sublet|assignment|without consent', "Subletting & Alterations",
         "This provision requires formal written permission before any structural changes or subletting can occur.")
    ]

    # Standard markers
    standard_patterns = [
        (r'governing law|jurisdiction|arbitration|courts of', "Governing Law",
         "This is a standard dispute resolution clause identifying governing jurisdiction."),
        (r'severability|invalidity of any provision', "Severability",
         "Standard legal boilerplate ensuring surviving provisions remain enforceable."),
        (r'entire agreement|supersedes all prior', "Entire Agreement",
         "Standard integration clause confirming this contract supersedes oral discussions."),
        (r'notices? shall be given|certified mail|written notice', "Notice Requirements",
         "Customary communication protocol specifying how official notices must be transmitted.")
    ]

    for p in paragraphs:
        p_lower = p.lower()
        matched = False

        # 1. Check Risk
        for pattern, cat, expl in risk_patterns:
            if re.search(pattern, p_lower):
                classified_clauses.append({
                    "clause_text": p[:300],
                    "category": cat,
                    "severity": "risk",
                    "explanation": expl
                })
                matched = True
                break
        if matched:
            continue

        # 2. Check Attention
        for pattern, cat, expl in attention_patterns:
            if re.search(pattern, p_lower):
                classified_clauses.append({
                    "clause_text": p[:300],
                    "category": cat,
                    "severity": "attention",
                    "explanation": expl
                })
                matched = True
                break
        if matched:
            continue

        # 3. Check Standard
        for pattern, cat, expl in standard_patterns:
            if re.search(pattern, p_lower):
                classified_clauses.append({
                    "clause_text": p[:300],
                    "category": cat,
                    "severity": "standard",
                    "explanation": expl
                })
                matched = True
                break

    # If few clauses matched, include generic standard clauses from paragraphs
    if len(classified_clauses) < 3:
        for p in paragraphs[:5]:
            if not any(c["clause_text"] == p[:300] for c in classified_clauses):
                classified_clauses.append({
                    "clause_text": p[:300],
                    "category": "General Provisions",
                    "severity": "standard",
                    "explanation": "Standard operational clause outlining mutual agreement terms."
                })

    # Localize explanations if Hindi or Gujarati requested
    if language in ["hi", "gu"]:
        for c in classified_clauses:
            if language == "hi":
                if c["severity"] == "risk":
                    c["explanation"] = "इस शर्त को स्पष्ट करना उचित हो सकता है क्योंकि यह एकतरफा दायित्व या सुरक्षा राशि के नुकसान का जोखिम पैदा करती है।"
                elif c["severity"] == "attention":
                    c["explanation"] = "यह शर्त महत्वपूर्ण दायित्वों को रेखांकित करती है जिसकी सावधानीपूर्वक समीक्षा आवश्यक है।"
                else:
                    c["explanation"] = "यह एक मानक कानूनी खंड है जो अनुबंध के सामान्य संचालन को नियंत्रित करता है।"
            elif language == "gu":
                if c["severity"] == "risk":
                    c["explanation"] = "આ શરતની સ્પષ્ટતા કરવી યોગ્ય રહેશે કારણ કે તે એકતરફી જવાબદારી અથવા ડિપોઝિટ જપ્તીનું જોખમ ઊભું કરે છે."
                elif c["severity"] == "attention":
                    c["explanation"] = "આ કલમ મહત્ત્વપૂર્ણ જવાબદારીઓ દર્શાવે છે જેની કાળજીપૂર્વક ચકાસણી કરવી જરૂરી છે."
                else:
                    c["explanation"] = "આ એક પ્રમાણભૂત કાનૂની જોગવાઈ છે જે કરારના સામાન્ય સંચાલનને નિયંત્રિત કરે છે."

    return {"clauses": classified_clauses}

def analyze_clauses(full_text: str, language: str = "en") -> Dict[str, Any]:
    """
    Sends document to Groq to identify 10-15 significant clauses and classify each
    as 'standard' / 'attention' / 'risk'.
    Instructs the model to NEVER give definitive legal verdicts ('this is illegal') -
    only 'this may be worth clarifying because...'.
    Returns JSON: {"clauses": [{"clause_text": "excerpt", "category": "...", "severity": "...", "explanation": "..."}]}
    """
    lang_key = language.lower() if language.lower() in LANGUAGE_INSTRUCTIONS else "en"
    lang_instruction = LANGUAGE_INSTRUCTIONS[lang_key]

    client = get_groq_client()
    if not client:
        return fallback_analyze_clauses(full_text, language=lang_key)

    system_prompt = (
        "You are an expert contract risk analyst and legal reviewer.\n"
        "Your role is to examine the provided legal document, identify 10 to 15 significant clauses, "
        "and classify each clause into one of three distinct severity tiers:\n"
        "1. 'standard': Customary, balanced, mutual, or boilerplate clauses (e.g. standard governing law, severability, integration).\n"
        "2. 'attention': Notable obligations, conditional liabilities, non-standard operational timelines, or repair duties requiring careful review.\n"
        "3. 'risk': Highly one-sided, unusual, or disadvantageous provisions (e.g. arbitrary forfeiture of deposit, excessive penalties, "
        "automatic renewal traps with narrow windows, broad liability waivers, unilateral rent increases, waiver of remedies).\n\n"
        "CRITICAL RULES:\n"
        "- NEVER issue definitive legal verdicts such as 'this is illegal', 'this violates statutory law', or 'this is unlawful'.\n"
        "- ALWAYS frame concerns objectively, such as 'this may be worth clarifying because...', "
        "'this provision creates potential exposure by...', or 'parties typically negotiate mutual terms for...'.\n"
        f"- {lang_instruction}\n"
        "- The 'severity' value MUST strictly be one of: 'standard', 'attention', 'risk'.\n"
        "- The 'category' value MUST be a concise English category name (e.g. 'Security Deposit', 'Termination', 'Liability', 'Governing Law').\n"
        "- Respond strictly in valid JSON matching this schema:\n"
        "{\n"
        '  "clauses": [\n'
        '    {\n'
        '      "clause_text": "Exact or summarized excerpt from the document",\n'
        '      "category": "Concise Category in English",\n'
        '      "severity": "standard" | "attention" | "risk",\n'
        '      "explanation": "Clear explanation of why this was classified this way, keeping guidance objective."\n'
        '    }\n'
        '  ]\n'
        "}"
    )

    user_prompt = (
        f"Legal Document Text:\n\n{full_text}\n\n"
        "Analyze the document, extract 10-15 key clauses, classify each into standard/attention/risk, and return JSON:"
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
        data = clean_json_response(response.choices[0].message.content)
        if "clauses" not in data or not isinstance(data["clauses"], list):
            raise ValueError("Invalid format: 'clauses' array missing.")
        
        # Ensure severity and category are standardized
        for c in data["clauses"]:
            sev = str(c.get("severity", "standard")).lower()
            if "risk" in sev:
                c["severity"] = "risk"
            elif "attention" in sev:
                c["severity"] = "attention"
            else:
                c["severity"] = "standard"
            
        return data
    except Exception:
        return fallback_analyze_clauses(full_text, language=lang_key)
