import json
import re
from typing import Dict, Any, List, Optional
from groq import Groq

from backend.core.config import GROQ_API_KEY, GROQ_MODEL

LANGUAGE_INSTRUCTIONS = {
    "en": "Generate the plain summary and key points in English.",
    "hi": "Generate the plain summary, key points, and document type in Hindi (Devanagari script), while keeping JSON keys in English.",
    "gu": "Generate the plain summary, key points, and document type in Gujarati (Gujarati script), while keeping JSON keys in English."
}

def get_groq_client() -> Optional[Groq]:
    if GROQ_API_KEY:
        return Groq(api_key=GROQ_API_KEY, timeout=20.0)
    return None

def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """Clean model response and parse JSON safely."""
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return json.loads(text.strip())

def fallback_simplify(full_text: str, language: str = "en") -> Dict[str, Any]:
    """Heuristic fallback summary when Groq API key is not configured."""
    text_lower = full_text.lower()
    
    # Detect document type
    doc_type = "Legal Agreement"
    if "lease" in text_lower or "rental" in text_lower or "tenant" in text_lower:
        doc_type = "Residential/Commercial Rental Agreement"
    elif "non-disclosure" in text_lower or "confidentiality" in text_lower:
        doc_type = "Non-Disclosure Agreement (NDA)"
    elif "employment" in text_lower or "employee" in text_lower:
        doc_type = "Employment Contract"
    elif "services" in text_lower or "contractor" in text_lower:
        doc_type = "Services Agreement"

    # Identify lines with key financial, deadline, or obligation markers
    lines = [line.strip() for line in full_text.split("\n") if line.strip()]
    key_points = []
    
    for line in lines:
        if any(marker in line.lower() for marker in [
            "rent", "deposit", "payment", "term", "termination", 
            "liability", "notice", "confidential", "shall", "must", "governing law"
        ]):
            if len(line) > 20 and len(key_points) < 7:
                clean_point = re.sub(r'^[0-9]+[.\-)]\s*', '', line)
                if clean_point not in key_points:
                    key_points.append(clean_point[:160])

    if not key_points:
        key_points = [
            "Parties entered into a legally binding arrangement.",
            "Key financial terms and payment schedules are defined.",
            "Termination clauses stipulate notice requirements.",
            "Confidentiality and dispute procedures are established."
        ]

    if language == "hi":
        return {
            "document_type": f"{doc_type} (कानूनी दस्तावेज)",
            "plain_summary": (
                "यह एक कानूनी अनुबंध है जो शामिल पक्षों के अधिकारों, कर्तव्यों और भुगतान की शर्तों को रेखांकित करता है। "
                "दस्तावेज़ में समाप्ति की प्रक्रिया, सुरक्षा राशि और किसी भी उल्लंघन पर देयता का उल्लेख है।\n\n"
                "पक्षों को सलाह दी जाती है कि वे हस्ताक्षर करने से पहले सभी समय-सीमाओं और शर्तों की समीक्षा कर लें।"
            ),
            "key_points": [
                f"अनुबंध प्रकार: {doc_type}",
                "भुगतान और देय तिथियों का कड़ाई से पालन करना अनिवार्य है।",
                "समाप्ति और नोटिस अवधि की पूर्व सूचना आवश्यक है।",
                "विवाद समाधान की शर्तें अनुबंध में उल्लिखित हैं।"
            ]
        }
    elif language == "gu":
        return {
            "document_type": f"{doc_type} (કાનૂની દસ્તાવેજ)",
            "plain_summary": (
                "આ એક કાનૂની કરાર છે જે સામેલ પક્ષોના અધિકારો, ફરજો અને ચુકવણીની શરતો દર્શાવે છે. "
                "દસ્તાવેજમાં સમાપ્તિની પ્રક્રિયા, સુરક્ષા થાપણ અને નિયમોના ઉલ્લંઘન પરની જવાબદારી દર્શાવવામાં આવી છે.\n\n"
                "પક્ષકારોને સલાહ આપવામાં આવે છે કે તેઓ સહી કરતા પહેલા તમામ સમયમર્યાદા અને નાણાકીય શરતો તપાસી લે."
            ),
            "key_points": [
                f"કરાર પ્રકાર: {doc_type}",
                "ચુકવણી અને મુદત સંબંધિત શરતોનું પાલન કરવું જરૂરી છે.",
                "સમાપ્તિ અને નોટિસનો સમયગાળો કરાર મુજબ રહેશે.",
                "વિવાદ નિવારણ માટે નિર્દિષ્ટ કાનૂની ક્ષેત્ર લાગુ પડશે."
            ]
        }
    
    return {
        "document_type": doc_type,
        "plain_summary": (
            f"This document is a {doc_type.lower()} establishing binding commitments between the involved parties. "
            "It outlines core operational terms, payment and fee structures, and the duration of the agreement.\n\n"
            "The agreement details procedures for termination, confidentiality safeguards, and dispute resolution. "
            "Both parties are subject to specified notice requirements and liability terms as set forth in the contract."
        ),
        "key_points": key_points[:7]
    }

def chunk_long_text(text: str, chunk_words: int = 4000) -> List[str]:
    """Divide text into word-based chunks for long document processing."""
    words = text.split()
    if len(words) <= chunk_words:
        return [text]
    
    chunks = []
    for i in range(0, len(words), chunk_words):
        chunk_str = " ".join(words[i:i + chunk_words])
        chunks.append(chunk_str)
    return chunks

def simplify_document(full_text: str, language: str = "en") -> Dict[str, Any]:
    """
    Sends document to Groq with a system prompt to rewrite in plain language,
    preserving all obligations, deadlines, and amounts.
    Returns: {"plain_summary": "2-3 paragraphs", "key_points": ["5-8 bullet points"], "document_type": "detected type"}
    Chunk very long documents (6000+ words) into sections, summarize each, then combine.
    Instructs model to NEVER give definitive legal verdicts.
    """
    lang_key = language.lower() if language.lower() in LANGUAGE_INSTRUCTIONS else "en"
    lang_instruction = LANGUAGE_INSTRUCTIONS[lang_key]

    client = get_groq_client()
    if not client:
        return fallback_simplify(full_text, language=lang_key)

    system_prompt = (
        "You are an expert legal document analyst specializing in plain-language legal communication.\n"
        "Your task is to analyze legal documents and rewrite them in clear, accessible plain language "
        "while rigorously preserving all obligations, deadlines, monetary amounts, and liabilities.\n\n"
        "CRITICAL LEGAL GUIDELINES:\n"
        "1. NEVER issue definitive legal verdicts or declare anything 'illegal' or 'unlawful'.\n"
        "2. Use neutral, informative phrasing such as 'this may be worth clarifying because...' or "
        "'this provision requires attention as it assigns responsibility to...'.\n"
        f"3. {lang_instruction}\n"
        "4. Respond strictly in valid JSON format matching this exact schema:\n"
        "{\n"
        '  "document_type": "detected legal document type",\n'
        '  "plain_summary": "2 to 3 cohesive paragraphs summarizing the agreement",\n'
        '  "key_points": ["5 to 8 specific bullet points covering core obligations, amounts, and dates"]\n'
        "}"
    )

    # Check for long document (> 6000 words)
    words = full_text.split()
    if len(words) > 6000:
        sections = chunk_long_text(full_text, chunk_words=3500)
        section_summaries = []
        for idx, sec in enumerate(sections):
            user_sec_prompt = (
                f"Section {idx+1} of {len(sections)} of a legal document:\n\n{sec}\n\n"
                "Summarize the key clauses, obligations, financial numbers, and dates of this section:"
            )
            try:
                res = client.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": "Summarize this legal section concisely preserving all dates, numbers, and obligations."},
                        {"role": "user", "content": user_sec_prompt}
                    ],
                    temperature=0.2,
                    max_tokens=1024,
                )
                section_summaries.append(res.choices[0].message.content)
            except Exception:
                section_summaries.append(sec[:1500])

        combined_text = "\n\n".join(section_summaries)
        user_prompt = (
            f"Here are the summarized sections of a long legal document:\n\n{combined_text}\n\n"
            "Produce the final plain-language summary, 5-8 key points, and detected document type in valid JSON:"
        )
    else:
        user_prompt = (
            f"Legal Document Text:\n\n{full_text}\n\n"
            "Analyze this document and produce the plain-language summary, key points, and document type in JSON:"
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
            max_tokens=2048,
        )
        data = clean_json_response(response.choices[0].message.content)
        
        # Verify schema keys
        if "plain_summary" not in data or "key_points" not in data or "document_type" not in data:
            raise ValueError("Model response missing required schema fields.")
        return data
    except Exception:
        # Fallback to deterministic summary if API fails
        return fallback_simplify(full_text, language=lang_key)
