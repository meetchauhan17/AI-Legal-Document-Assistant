import { NextRequest, NextResponse } from 'next/server';
import { callGroq, cleanJson } from '@/lib/groq';
import { getDocument } from '@/lib/store';

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Respond in English.',
  hi: 'Write all checklist items and questions in Hindi (Devanagari script). Keep JSON keys in English.',
  gu: 'Write all checklist items and questions in Gujarati (Gujarati script). Keep JSON keys in English.',
};

function getHeuristicChecklist(text: string, riskClauses: any[], language: string) {
  const checklist: string[] = [];
  const questions: string[] = [];

  // Extract dollar amounts
  const amounts = text.match(/\$[\d,]+(?:\.\d{2})?/g) || [];
  if (amounts.length > 0) {
    checklist.push(`Verify exact scheduled amounts and payment dates: ${amounts.slice(0, 3).join(', ')}.`);
  }

  // Check for risk clauses
  for (const c of riskClauses) {
    const cat = c.category || '';
    const excerpt = (c.clause_text || '').slice(0, 80).replace(/\n/g, ' ');

    if (/deposit/i.test(cat) || /deposit/i.test(excerpt)) {
      checklist.push(`Clarify return conditions and formal inspection reports for the security deposit.`);
      questions.push('Under what specific objective criteria can any portion of the security deposit be withheld?');
    } else if (/evict|access|notice/i.test(cat) || /notice/i.test(excerpt)) {
      checklist.push(`Confirm minimum written notice required before property entry or termination enforcement.`);
      questions.push('What is the mandatory advance written notice required prior to landlord entry or lease termination?');
    } else if (/renewal|auto-renew/i.test(cat)) {
      checklist.push(`Calendar the exact deadline window required to opt out of automatic contract renewal.`);
      questions.push('What written format and address are required to issue non-renewal notice?');
    }
  }

  // Defaults if needed
  if (checklist.length < 4) {
    checklist.push(
      'Verify all counterparty contact details and notice addresses.',
      'Check that all exhibit schedules and attachments are appended.',
      'Confirm responsibility thresholds for maintenance, utilities, and insurance.',
      'Ensure no blanks or unfilled signature lines remain in the agreement.'
    );
  }

  if (questions.length < 3) {
    questions.push(
      'What are the exact penalty amounts and grace periods for delayed payments?',
      'Which party bears legal costs and attorney fees in the event of an alleged default?',
      'Is there an option for mutual early termination with reasonable advance notice?'
    );
  }

  return {
    before_signing_checklist: checklist.slice(0, 8),
    questions_to_ask: questions.slice(0, 5),
    language,
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

    try {
      const raw = await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], true, 0.2);

      const parsed = cleanJson(raw, null);
      if (parsed && Array.isArray(parsed.before_signing_checklist) && parsed.before_signing_checklist.length > 0) {
        return NextResponse.json({
          before_signing_checklist: parsed.before_signing_checklist,
          questions_to_ask: Array.isArray(parsed.questions_to_ask) ? parsed.questions_to_ask : [],
          document_id: body.document_id || '',
          language: lang,
        });
      }
    } catch {
      // Groq failed -> Use heuristic document checklist
    }

    const heuristic = getHeuristicChecklist(text, riskClauses, lang);
    return NextResponse.json({
      before_signing_checklist: heuristic.before_signing_checklist,
      questions_to_ask: heuristic.questions_to_ask,
      document_id: body.document_id || '',
      language: lang,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checklist generation failed';
    return NextResponse.json(
      { detail: message },
      { status: 500 }
    );
  }
}
