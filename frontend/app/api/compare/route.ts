import { NextRequest, NextResponse } from 'next/server';
import { callGroq, cleanJson } from '@/lib/groq';

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Respond in English.',
  hi: "Write all 'note' fields and 'overall_summary' in Hindi (Devanagari script). Keep 'aspect', 'document_a_value', 'document_b_value', 'more_favorable' in English.",
  gu: "Write all 'note' fields and 'overall_summary' in Gujarati (Gujarati script). Keep 'aspect', 'document_a_value', 'document_b_value', 'more_favorable' in English.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text_a = (body.text_a || '').trim();
    const text_b = (body.text_b || '').trim();
    const lang = body.language || 'en';

    if (!text_a || !text_b) {
      return NextResponse.json(
        { detail: 'Both text_a and text_b are required for comparison.' },
        { status: 400 }
      );
    }

    const langInst = LANGUAGE_INSTRUCTIONS[lang] || LANGUAGE_INSTRUCTIONS.en;

    const systemPrompt = `You are an expert contract comparison analyst.
You will receive two legal documents labeled 'DOCUMENT A' and 'DOCUMENT B'.
Your task is to identify all meaningful differences between them across these dimensions:
- Financial amounts (rent, deposits, fees, penalties, caps)
- Time durations (lease term, notice periods, grace periods, renewal windows)
- Clauses present in one but absent in the other
- Risk allocation (indemnification, liability, forfeiture, eviction procedures)
- Governing law and jurisdiction

For each difference, indicate 'more_favorable': 'a' (if Document A is better for the signing party), 'b' (if Document B is better), or 'neutral' (if equal or contextual).

Rules:
1. Only identify REAL differences — do not invent differences that do not exist.
2. NEVER issue legal verdicts. Use phrasing like 'this may be worth clarifying because...'.
3. ${langInst}
4. Respond ONLY in valid JSON matching this exact schema:
{
  "comparison_points": [
    {
      "aspect": "Concise aspect name in English",
      "document_a_value": "Value or clause from Document A",
      "document_b_value": "Value or clause from Document B",
      "more_favorable": "a | b | neutral",
      "note": "Plain language explanation of the difference"
    }
  ],
  "overall_summary": "2-3 sentence summary of the overall comparison"
}`;

    const userPrompt = `DOCUMENT A:\n${text_a.slice(0, 6000)}\n\n---\n\nDOCUMENT B:\n${text_b.slice(0, 6000)}\n\nIdentify all key differences and output them in the specified JSON format:`;

    const raw = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], true, 0.2);

    const fallback = {
      comparison_points: [
        {
          aspect: 'Key Terms & Obligations',
          document_a_value: 'Terms outlined in Document A',
          document_b_value: 'Terms outlined in Document B',
          more_favorable: 'neutral',
          note: 'Review terms carefully to assess which agreement is more advantageous.',
        },
      ],
      overall_summary: 'Both documents contain key obligations and legal conditions with distinctive requirements.',
    };

    const parsed = cleanJson(raw, fallback);

    return NextResponse.json({
      comparison_points: Array.isArray(parsed.comparison_points) && parsed.comparison_points.length > 0
        ? parsed.comparison_points
        : fallback.comparison_points,
      overall_summary: parsed.overall_summary || fallback.overall_summary,
      language: lang,
    });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || 'Comparison failed' },
      { status: 500 }
    );
  }
}
