import { NextRequest, NextResponse } from 'next/server';
import { callGroq, cleanJson } from '@/lib/groq';
import { getDocument } from '@/lib/store';

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: "Write the 'explanation' field in English.",
  hi: "Write the 'explanation' field in Hindi (Devanagari script). Keep 'severity' exactly as 'standard'|'attention'|'risk' and 'category' in English.",
  gu: "Write the 'explanation' field in Gujarati (Gujarati script). Keep 'severity' exactly as 'standard'|'attention'|'risk' and 'category' in English.",
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

    const systemPrompt = `You are an expert legal risk analyst.
Analyze the following legal document clause by clause. Classify key terms into three clear categories:
1. "standard": Routine, customary terms that are typical in such agreements.
2. "attention": Terms that impose significant duties or restrictions requiring careful awareness.
3. "risk": Disadvantageous, one-sided, auto-renewal traps, or high-penalty clauses.

${langInst}

Respond ONLY with a valid JSON object matching this schema:
{
  "clauses": [
    {
      "clause_text": "<exact excerpt or verbatim sentence from the document>",
      "category": "<e.g., Security Deposit, Renewal Terms, Maintenance & Repairs, Liability & Indemnity, Termination, Governing Law>",
      "category_level": "<must be exactly one of: standard | attention | risk>",
      "explanation": "<plain-language explanation of why this clause belongs in this category and what it means for the signing party>"
    }
  ]
}`;

    const raw = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Document to analyze:\n\n${text.slice(0, 12000)}` },
    ], true);

    const fallback = {
      clauses: [
        {
          clause_text: text.slice(0, 200),
          category: 'Key Obligation',
          category_level: 'standard',
          explanation: 'Standard legal obligation clause outlining initial agreement parameters.',
        },
      ],
      language: lang,
    };

    const parsed = cleanJson(raw, fallback);

    const clauses = (parsed.clauses || []).map((c: any) => ({
      clause_text: c.clause_text || '',
      category: c.category || 'General',
      category_level: ['standard', 'attention', 'risk'].includes(c.category_level)
        ? c.category_level
        : (c.severity || 'attention'),
      explanation: c.explanation || '',
    }));

    return NextResponse.json({
      clauses,
      language: lang,
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Risk analysis failed' }, { status: 500 });
  }
}
