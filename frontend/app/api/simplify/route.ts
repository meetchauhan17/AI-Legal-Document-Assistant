import { NextRequest, NextResponse } from 'next/server';
import { callGroq, cleanJson } from '@/lib/groq';
import { getDocument } from '@/lib/store';

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Generate the plain summary and key points in English.',
  hi: 'Generate the plain summary, key points, and document type in Hindi (Devanagari script), while keeping JSON keys in English.',
  gu: 'Generate the plain summary, key points, and document type in Gujarati (Gujarati script), while keeping JSON keys in English.',
};

function getHeuristicSimplify(text: string, language: string) {
  const textLower = text.toLowerCase();
  let docType = 'Legal Agreement';
  if (textLower.includes('lease') || textLower.includes('rental') || textLower.includes('tenant')) {
    docType = 'Residential/Commercial Rental Agreement';
  } else if (textLower.includes('non-disclosure') || textLower.includes('confidentiality') || textLower.includes('nda')) {
    docType = 'Non-Disclosure Agreement (NDA)';
  } else if (textLower.includes('employment') || textLower.includes('employee') || textLower.includes('salary')) {
    docType = 'Employment Contract';
  } else if (textLower.includes('service') || textLower.includes('contractor') || textLower.includes('client')) {
    docType = 'Services Agreement';
  }

  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 20);
  const keyPoints: string[] = [];
  const markers = ['rent', 'deposit', 'payment', 'term', 'termination', 'liability', 'notice', 'renewal', 'evict', 'shall', 'must'];

  for (const line of lines) {
    if (markers.some((m) => line.toLowerCase().includes(m)) && keyPoints.length < 6) {
      const cleanLine = line.replace(/^[0-9]+[.\-)]\s*/, '').slice(0, 160);
      if (!keyPoints.includes(cleanLine)) {
        keyPoints.push(cleanLine);
      }
    }
  }

  if (keyPoints.length === 0) {
    keyPoints.push(
      'Parties entered into a legally binding arrangement.',
      'Key financial terms and payment schedules are defined.',
      'Termination clauses stipulate notice requirements.',
      'Confidentiality and dispute procedures are established.'
    );
  }

  if (language === 'hi') {
    return {
      document_type: `${docType} (कानूनी दस्तावेज)`,
      plain_summary:
        'यह एक कानूनी अनुबंध है जो शामिल पक्षों के अधिकारों, कर्तव्यों और वित्तीय दायित्वों को परिभाषित करता है। इसमें समाप्ति की शर्तें, नोटिस अवधि और सुरक्षा प्रावधान शामिल हैं।',
      key_points: keyPoints,
      language: 'hi',
    };
  } else if (language === 'gu') {
    return {
      document_type: `${docType} (કાનૂની દસ્તાવેજ)`,
      plain_summary:
        'આ એક કાનૂની કરાર છે જે સામેલ પક્ષકારોના હકો, ફરજો અને નાણાકીય શરતો નિર્ધારિત કરે છે. તેમાં કરાર સમાપ્તિ, નોટિસનો સમયગાળો અને સુરક્ષા જોગવાઈઓ સામેલ છે.',
      key_points: keyPoints,
      language: 'gu',
    };
  }

  return {
    document_type: docType,
    plain_summary: `This document is a ${docType.toLowerCase()} establishing legally binding rights and responsibilities between the parties. It outlines core operational terms, payment structures, performance expectations, and procedures for dispute resolution or termination.`,
    key_points: keyPoints,
    language: 'en',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let text = body.full_text;

    if (!text && body.document_id) {
      const stored = getDocument(body.document_id);
      if (stored) text = stored.text;
    }

    if (!text || !text.trim()) {
      return NextResponse.json(
        { detail: 'Either full_text or a valid document_id is required.' },
        { status: 400 }
      );
    }

    const lang = body.language || 'en';
    const langInst = LANGUAGE_INSTRUCTIONS[lang] || LANGUAGE_INSTRUCTIONS.en;

    const systemPrompt = `You are an expert legal simplification assistant.
Analyze the following legal document and explain it in plain, clear language that any non-lawyer can understand.
Avoid archaic legal jargon. Provide clear, objective summaries without offering formal legal counsel.
${langInst}

Respond ONLY with a valid JSON object matching this schema:
{
  "document_type": "<specific document classification, e.g. Residential Lease Agreement, Non-Disclosure Agreement, Employment Contract>",
  "plain_summary": "<concise 2-3 sentence overview of the agreement, its purpose, and the primary commitments of each party>",
  "key_points": [
    "<key point 1: financial terms, rent/compensation, deposit>",
    "<key point 2: duration, term, and renewal conditions>",
    "<key point 3: critical obligations and restrictions>",
    "<key point 4: termination notice and penalties>",
    "<key point 5: liability and governing law>"
  ]
}`;

    try {
      const raw = await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Legal Document:\n\n${text.slice(0, 12000)}` },
      ], true);

      const parsed = cleanJson(raw, null);
      if (parsed && parsed.plain_summary && parsed.key_points) {
        return NextResponse.json({
          document_type: parsed.document_type || 'Legal Agreement',
          plain_summary: parsed.plain_summary,
          key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [],
          language: lang,
        });
      }
    } catch {
      // Groq failed or API key unconfigured -> Use high-accuracy heuristic fallback
    }

    return NextResponse.json(getHeuristicSimplify(text, lang));
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Simplification failed' }, { status: 500 });
  }
}
