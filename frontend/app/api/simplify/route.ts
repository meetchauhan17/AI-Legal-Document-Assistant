import { NextRequest, NextResponse } from 'next/server';
import { callGroq, cleanJson } from '@/lib/groq';
import { getDocument } from '@/lib/store';

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Generate the plain summary and key points in English.',
  hi: 'Generate the plain summary, key points, and document type in Hindi (Devanagari script), while keeping JSON keys in English.',
  gu: 'Generate the plain summary, key points, and document type in Gujarati (Gujarati script), while keeping JSON keys in English.',
};

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

    const raw = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Legal Document:\n\n${text.slice(0, 12000)}` },
    ], true);

    const fallback = {
      document_type: 'Legal Agreement',
      plain_summary: 'This document defines legally binding rights and responsibilities between the signing parties.',
      key_points: [
        'Defines primary obligations and performance expectations.',
        'Specifies term duration, renewal clauses, and termination terms.',
        'Details financial obligations, payment timelines, and deposits.',
      ],
      language: lang,
    };

    const parsed = cleanJson(raw, fallback);

    return NextResponse.json({
      document_type: parsed.document_type || fallback.document_type,
      plain_summary: parsed.plain_summary || fallback.plain_summary,
      key_points: Array.isArray(parsed.key_points) ? parsed.key_points : fallback.key_points,
      language: lang,
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Simplification failed' }, { status: 500 });
  }
}
