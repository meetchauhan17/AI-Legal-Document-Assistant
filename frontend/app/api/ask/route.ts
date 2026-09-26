import { NextRequest, NextResponse } from 'next/server';
import { callGroq, cleanJson } from '@/lib/groq';
import { getDocument } from '@/lib/store';

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Answer the question in English.',
  hi: 'Answer the question in Hindi (Devanagari script). Keep JSON keys in English.',
  gu: 'Answer the question in Gujarati (Gujarati script). Keep JSON keys in English.',
};

function getHeuristicQA(text: string, question: string, language: string) {
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  // Extract key question terms
  const terms = question
    .toLowerCase()
    .replace(/[?.,!]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['what', 'when', 'where', 'which', 'who', 'does', 'have', 'from', 'this', 'that', 'with'].includes(w));

  let bestParagraph = '';
  let bestScore = 0;

  for (const p of paragraphs) {
    const pLower = p.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (pLower.includes(term)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestParagraph = p;
    }
  }

  if (bestScore > 0 && bestParagraph) {
    return {
      answer: `According to the document: ${bestParagraph.replace(/\n/g, ' ').slice(0, 300)}`,
      source_excerpt: bestParagraph.replace(/\n/g, ' ').slice(0, 250),
      confidence: bestScore >= 2 ? 'high' : 'medium',
    };
  }

  const notFoundMsg =
    language === 'hi'
      ? 'यह दस्तावेज़ इस प्रश्न का स्पष्ट उत्तर नहीं देता।'
      : language === 'gu'
      ? 'આ દસ્તાવેજ આ પ્રશ્ન અંગે કોઈ સ્પષ્ટ માહિતી આપતો નથી.'
      : 'This document does not appear to address that specific question.';

  return {
    answer: notFoundMsg,
    source_excerpt: '',
    confidence: 'low',
  };
}

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

    try {
      const raw = await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Document:\n\n${text.slice(0, 12000)}\n\nUser Question:\n${question}` },
      ], true);

      const parsed = cleanJson(raw, null);
      if (parsed && parsed.answer) {
        return NextResponse.json({
          answer: parsed.answer,
          source_excerpt: parsed.source_excerpt || '',
          confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'medium',
          document_id: body.document_id || '',
          question,
          language: lang,
        });
      }
    } catch {
      // Groq failed -> Use keyword-grounded heuristic Q&A
    }

    const heuristic = getHeuristicQA(text, question, lang);
    return NextResponse.json({
      answer: heuristic.answer,
      source_excerpt: heuristic.source_excerpt,
      confidence: heuristic.confidence,
      document_id: body.document_id || '',
      question,
      language: lang,
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Q&A failed' }, { status: 500 });
  }
}
