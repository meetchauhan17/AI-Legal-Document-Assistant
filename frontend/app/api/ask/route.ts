import { NextRequest, NextResponse } from 'next/server';
import { callGroq, cleanJson } from '@/lib/groq';
import { getDocument } from '@/lib/store';

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Answer the question in English.',
  hi: 'Answer the question in Hindi (Devanagari script). Keep JSON keys in English.',
  gu: 'Answer the question in Gujarati (Gujarati script). Keep JSON keys in English.',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = (body.question || '').trim();
    let text = body.full_text;

    if (!question) {
      return NextResponse.json({ detail: 'Question cannot be empty.' }, { status: 400 });
    }

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

    const systemPrompt = `You are an expert legal document Q&A assistant.
You answer user questions based STRICTLY and ONLY on the text provided from their legal document.
Do not hallucinate facts outside the provided document.
${langInst}

Respond ONLY with a valid JSON object matching this schema:
{
  "answer": "<direct, clear, concise answer grounded strictly in the document text>",
  "source_excerpt": "<exact verbatim quote from the document supporting this answer>",
  "confidence": "<must be exactly one of: high | medium | low>"
}`;

    const raw = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Document:\n\n${text.slice(0, 12000)}\n\nUser Question:\n${question}` },
    ], true);

    const fallback = {
      answer: "Based on the provided document text, this question is not explicitly addressed.",
      source_excerpt: "",
      confidence: "low",
    };

    const parsed = cleanJson(raw, fallback);

    return NextResponse.json({
      answer: parsed.answer || fallback.answer,
      source_excerpt: parsed.source_excerpt || fallback.source_excerpt,
      confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'medium',
      document_id: body.document_id || '',
      question,
      language: lang,
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Q&A failed' }, { status: 500 });
  }
}
