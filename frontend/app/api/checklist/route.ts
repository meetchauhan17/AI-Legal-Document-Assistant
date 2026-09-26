import { NextRequest, NextResponse } from 'next/server';
import { callGroq, cleanJson } from '@/lib/groq';
import { getDocument } from '@/lib/store';

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Respond in English.',
  hi: 'Write all checklist items and questions in Hindi (Devanagari script). Keep JSON keys in English.',
  gu: 'Write all checklist items and questions in Gujarati (Gujarati script). Keep JSON keys in English.',
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
    const riskClauses = Array.isArray(body.risk_clauses) ? body.risk_clauses : [];

    const riskSummaryLines = riskClauses.map((c: any) => {
      const cat = c.category || 'General';
      const severity = c.category_level || c.severity || 'attention';
      const excerpt = (c.clause_text || '').slice(0, 150).replace(/\n/g, ' ');
      const exp = (c.explanation || '').slice(0, 200);
      return `[${severity.toUpperCase()}] ${cat}: "${excerpt}" — ${exp}`;
    });
    const riskBlock = riskSummaryLines.length > 0 ? riskSummaryLines.join('\n') : 'No specific risk clauses identified.';

    const systemPrompt = `You are an expert pre-signing legal document advisor.
Your job is to generate a HIGHLY SPECIFIC pre-signing checklist and lawyer-prep questions based on the actual content of the provided document.

CRITICAL RULES:
1. Every checklist item MUST reference specific content from the document: quote exact dollar amounts, section names, clause titles, dates, or timeframes actually found in the text.
   NEVER write generic advice like 'Read the contract carefully' or 'Consult a lawyer'. Instead: 'Confirm the $4,400 deposit refund timeline in Section 3'.
2. Every question in 'questions_to_ask' MUST reference a specific clause, amount, or provision found in the document. Example: 'Under what circumstances can the landlord forfeit the full $4,400 deposit without an inspection report, as stated in Section 3?'
3. NEVER issue legal verdicts. Do not say 'this clause is illegal'. Use phrasing like 'this may be worth clarifying before signing'.
4. ${langInst}
5. Output ONLY valid JSON matching this exact schema:
{
  "before_signing_checklist": [
    "Specific actionable item referencing actual document content",
    ... (5 to 8 items total)
  ],
  "questions_to_ask": [
    "Specific question referencing an actual clause or amount",
    ... (3 to 5 questions total)
  ]
}`;

    const userPrompt = `DOCUMENT TEXT:\n${text.slice(0, 6000)}\n\nIDENTIFIED RISK/ATTENTION CLAUSES:\n${riskBlock}\n\nGenerate the actionable checklist and questions in JSON format:`;

    const raw = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], true, 0.2);

    const fallback = {
      before_signing_checklist: [
        'Confirm all financial sums, security deposits, and payment due dates explicitly stated in the document.',
        'Review renewal notice windows and termination notice periods.',
        'Verify maintenance and repair liability allocations between parties.',
        'Clarify consequences and penalty amounts for early termination or default.',
        'Ensure all blanks, dates, and exhibits are completed before signing.',
      ],
      questions_to_ask: [
        'Under what conditions can deposits or funds be withheld or penalized?',
        'What is the exact written notice required before any termination or enforcement action?',
        'Which party carries the indemnification and liability burden under dispute scenarios?',
      ],
    };

    const parsed = cleanJson(raw, fallback);

    return NextResponse.json({
      before_signing_checklist: Array.isArray(parsed.before_signing_checklist) && parsed.before_signing_checklist.length > 0
        ? parsed.before_signing_checklist
        : fallback.before_signing_checklist,
      questions_to_ask: Array.isArray(parsed.questions_to_ask) && parsed.questions_to_ask.length > 0
        ? parsed.questions_to_ask
        : fallback.questions_to_ask,
      document_id: body.document_id || '',
      language: lang,
    });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || 'Checklist generation failed' },
      { status: 500 }
    );
  }
}
