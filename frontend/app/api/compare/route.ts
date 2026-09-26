import { NextRequest, NextResponse } from 'next/server';
import { callGroq, cleanJson } from '@/lib/groq';

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Respond in English.',
  hi: "Write all 'note' fields and 'overall_summary' in Hindi (Devanagari script). Keep 'aspect', 'document_a_value', 'document_b_value', 'more_favorable' in English.",
  gu: "Write all 'note' fields and 'overall_summary' in Gujarati (Gujarati script). Keep 'aspect', 'document_a_value', 'document_b_value', 'more_favorable' in English.",
};

function extractPattern(text: string, patterns: RegExp[]): string {
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m && m[1]) return m[1].trim();
  }
  return 'Not specified';
}

function getHeuristicCompare(text_a: string, text_b: string, language: string) {
  const points: Array<{
    aspect: string;
    document_a_value: string;
    document_b_value: string;
    more_favorable: 'a' | 'b' | 'neutral';
    note: string;
  }> = [];

  // Monthly rent
  const rentA = extractPattern(text_a, [/monthly rent.*?\$?([\d,]+)/i, /rent.*?\$?([\d,]+)/i]);
  const rentB = extractPattern(text_b, [/monthly rent.*?\$?([\d,]+)/i, /rent.*?\$?([\d,]+)/i]);
  if (rentA !== 'Not specified' || rentB !== 'Not specified') {
    const valA = parseFloat(rentA.replace(/,/g, '')) || 999999;
    const valB = parseFloat(rentB.replace(/,/g, '')) || 999999;
    points.push({
      aspect: 'Monthly Rent',
      document_a_value: rentA !== 'Not specified' ? `$${rentA}` : 'Not specified',
      document_b_value: rentB !== 'Not specified' ? `$${rentB}` : 'Not specified',
      more_favorable: valA < valB ? 'a' : valB < valA ? 'b' : 'neutral',
      note: 'Lower monthly rent reduces ongoing fixed living costs for the tenant.',
    });
  }

  // Security deposit
  const depA = extractPattern(text_a, [/security deposit.*?\$?([\d,]+)/i, /deposit.*?\$?([\d,]+)/i]);
  const depB = extractPattern(text_b, [/security deposit.*?\$?([\d,]+)/i, /deposit.*?\$?([\d,]+)/i]);
  if (depA !== 'Not specified' || depB !== 'Not specified') {
    const valA = parseFloat(depA.replace(/,/g, '')) || 999999;
    const valB = parseFloat(depB.replace(/,/g, '')) || 999999;
    points.push({
      aspect: 'Security Deposit',
      document_a_value: depA !== 'Not specified' ? `$${depA}` : 'Not specified',
      document_b_value: depB !== 'Not specified' ? `$${depB}` : 'Not specified',
      more_favorable: valA < valB ? 'a' : valB < valA ? 'b' : 'neutral',
      note: 'Lower deposit requirements minimize upfront capital lockup at signing.',
    });
  }

  // Late fee
  const feeA = extractPattern(text_a, [/late (?:fee|charge|penalty).*?\$?([\d,]+)/i]);
  const feeB = extractPattern(text_b, [/late (?:fee|charge|penalty).*?\$?([\d,]+)/i]);
  if (feeA !== 'Not specified' || feeB !== 'Not specified') {
    const valA = parseFloat(feeA.replace(/,/g, '')) || 999999;
    const valB = parseFloat(feeB.replace(/,/g, '')) || 999999;
    points.push({
      aspect: 'Late Payment Fee',
      document_a_value: feeA !== 'Not specified' ? `$${feeA}` : 'Not specified',
      document_b_value: feeB !== 'Not specified' ? `$${feeB}` : 'Not specified',
      more_favorable: valA < valB ? 'a' : valB < valA ? 'b' : 'neutral',
      note: 'Lower late charges provide greater financial leniency in case of processing delays.',
    });
  }

  if (points.length === 0) {
    points.push({
      aspect: 'General Contract Provisions',
      document_a_value: 'Standard obligations and terms',
      document_b_value: 'Standard obligations and terms',
      more_favorable: 'neutral',
      note: 'Both documents specify customary legal rights and obligations.',
    });
  }

  return {
    comparison_points: points,
    overall_summary: `Document A and Document B were compared across ${points.length} primary financial and legal dimensions. Review individual points to determine the optimal agreement for your priorities.`,
    language,
  };
}

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

    try {
      const raw = await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], true, 0.2);

      const parsed = cleanJson(raw, null);
      if (parsed && Array.isArray(parsed.comparison_points) && parsed.comparison_points.length > 0) {
        return NextResponse.json({
          comparison_points: parsed.comparison_points,
          overall_summary: parsed.overall_summary || 'Comparison completed successfully.',
          language: lang,
        });
      }
    } catch {
      // Groq failed -> Use rule-based comparison fallback
    }

    return NextResponse.json(getHeuristicCompare(text_a, text_b, lang));
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || 'Comparison failed' },
      { status: 500 }
    );
  }
}
