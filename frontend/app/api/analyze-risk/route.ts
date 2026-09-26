import { NextRequest, NextResponse } from 'next/server';
import { callGroq, cleanJson } from '@/lib/groq';
import { getDocument } from '@/lib/store';

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: "Write the 'explanation' field in English.",
  hi: "Write the 'explanation' field in Hindi (Devanagari script). Keep 'severity' exactly as 'standard'|'attention'|'risk' and 'category' in English.",
  gu: "Write the 'explanation' field in Gujarati (Gujarati script). Keep 'severity' exactly as 'standard'|'attention'|'risk' and 'category' in English.",
};

function getHeuristicRisk(text: string, language: string) {
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 25);

  const clauses: Array<{
    clause_text: string;
    category: string;
    category_level: string;
    explanation: string;
  }> = [];

  const riskPatterns = [
    {
      regex: /forfeit.*deposit|deposit.*non-refundable|forfeiture/i,
      category: 'Security Deposit',
      explanation:
        'This may be worth clarifying because the landlord or counterparty retains the right to withhold or forfeit the security deposit without objective inspection or dispute resolution mechanisms.',
    },
    {
      regex: /without notice|immediate eviction|evict.*24 hours|enter.*any time/i,
      category: 'Access & Eviction',
      explanation:
        'This may be worth clarifying because it grants unilateral access or termination rights without standard statutory advance notice periods.',
    },
    {
      regex: /auto-renew|automatic renewal.*unless|90 days prior/i,
      category: 'Renewal Terms',
      explanation:
        'This may be worth clarifying because automatic renewal clauses with restrictive notice windows can inadvertently lock parties into subsequent lengthy commitments.',
    },
    {
      regex: /waive.*liability|sole liability|hold harmless.*all claims|unlimited indemnity/i,
      category: 'Liability & Indemnity',
      explanation:
        'This may be worth clarifying because it imposes broad indemnification or unilateral liability shifts onto one party.',
    },
    {
      regex: /penalty.*[0-9]{2}%|late fee.*exceed|\$150|unreasonable penalty/i,
      category: 'Late Fees & Penalties',
      explanation:
        'Late fee charges appear disproportionately elevated or lack standard grace periods compared to customary practices.',
    },
  ];

  const attentionPatterns = [
    {
      regex: /maintenance|repairs.*tenant|lessee shall repair|upkeep/i,
      category: 'Maintenance & Repairs',
      explanation:
        'This clause assigns substantial upkeep responsibilities that typically benefit from written financial caps or shared liability thresholds.',
    },
    {
      regex: /late fee|grace period|due on the first/i,
      category: 'Payment Terms',
      explanation:
        'Specifies strict payment deadlines and immediate penalties for delayed remittance.',
    },
    {
      regex: /alteration|sublet|assignment|without consent/i,
      category: 'Subletting & Alterations',
      explanation:
        'Requires formal written permission before any structural adjustments, assignments, or subletting can take place.',
    },
  ];

  const standardPatterns = [
    {
      regex: /governing law|jurisdiction|arbitration|laws of/i,
      category: 'Governing Law',
      explanation:
        'Standard dispute resolution clause designating the governing legal jurisdiction and forum.',
    },
    {
      regex: /severability|invalidity of any provision/i,
      category: 'Severability',
      explanation:
        'Standard legal boilerplate ensuring surviving provisions remain enforceable if one part is deemed invalid.',
    },
    {
      regex: /entire agreement|supersedes all prior/i,
      category: 'Entire Agreement',
      explanation:
        'Standard integration clause confirming this contract supersedes all prior oral or written discussions.',
    },
  ];

  for (const p of paragraphs) {
    let matched = false;

    for (const r of riskPatterns) {
      if (r.regex.test(p)) {
        clauses.push({
          clause_text: p.slice(0, 300),
          category: r.category,
          category_level: 'risk',
          explanation: r.explanation,
        });
        matched = true;
        break;
      }
    }
    if (matched) continue;

    for (const a of attentionPatterns) {
      if (a.regex.test(p)) {
        clauses.push({
          clause_text: p.slice(0, 300),
          category: a.category,
          category_level: 'attention',
          explanation: a.explanation,
        });
        matched = true;
        break;
      }
    }
    if (matched) continue;

    for (const s of standardPatterns) {
      if (s.regex.test(p)) {
        clauses.push({
          clause_text: p.slice(0, 300),
          category: s.category,
          category_level: 'standard',
          explanation: s.explanation,
        });
        matched = true;
        break;
      }
    }
  }

  // If no clauses matched, provide fallback
  if (clauses.length === 0) {
    clauses.push({
      clause_text: text.slice(0, 250),
      category: 'Core Terms & Conditions',
      category_level: 'standard',
      explanation: 'Routine operational commitments defining the core scope of the agreement.',
    });
  }

  return { clauses, language };
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

    try {
      const raw = await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Document to analyze:\n\n${text.slice(0, 12000)}` },
      ], true);

      const parsed = cleanJson(raw, null);
      if (parsed && Array.isArray(parsed.clauses) && parsed.clauses.length > 0) {
        const clauses = parsed.clauses.map((c: any) => ({
          clause_text: c.clause_text || '',
          category: c.category || 'General',
          category_level: ['standard', 'attention', 'risk'].includes(c.category_level)
            ? c.category_level
            : (c.severity || 'attention'),
          explanation: c.explanation || '',
        }));

        return NextResponse.json({ clauses, language: lang });
      }
    } catch {
      // Groq failed -> Use deterministic heuristic risk analysis
    }

    return NextResponse.json(getHeuristicRisk(text, lang));
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Risk analysis failed' }, { status: 500 });
  }
}
