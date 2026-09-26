// Centralised API base URL — dynamically resolves to relative or configured URL
function getInitialApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  // If in browser on production (e.g. Vercel *.vercel.app)
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
      // In production browser, if envUrl points to hf.space or is empty, use relative '' to hit Next.js serverless routes
      if (!envUrl || envUrl.includes('hf.space') || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return '';
      }
      return envUrl.replace(/\/+$/, '');
    }
  }

  // If environment variable is explicitly provided and not hf.space
  if (envUrl && !envUrl.includes('hf.space')) {
    return envUrl.replace(/\/+$/, '');
  }

  // Default to relative path for full Vercel serverless integration
  return '';
}

export const API_BASE = getInitialApiBase();

/**
 * Resilient fetch that tries API_BASE first, and automatically falls back
 * to Next.js native serverless routes if external API returns 404, 405, 502, or fails.
 */
async function resilientFetch(path: string, options: RequestInit): Promise<Response> {
  const primaryUrl = API_BASE ? `${API_BASE}${path}` : path;
  let primaryRes: Response | null = null;
  let primaryError: any = null;

  try {
    primaryRes = await fetch(primaryUrl, options);
    // If primary responded with success or client validation error (400), return it
    if (primaryRes.ok || primaryRes.status === 400 || !API_BASE) {
      return primaryRes;
    }
  } catch (err) {
    primaryError = err;
  }

  // If primary failed (network error, CORS, 404, 405 Method Not Allowed, 502/503/500)
  // and we were calling an external API_BASE, fall back to native Next.js API route!
  if (API_BASE && (primaryError || !primaryRes || primaryRes.status === 405 || primaryRes.status >= 500 || primaryRes.status === 404)) {
    try {
      const fallbackRes = await fetch(path, options);
      if (fallbackRes.ok || fallbackRes.status === 400) {
        return fallbackRes;
      }
      return fallbackRes;
    } catch {
      // Fallback failed too, return or re-throw primary
    }
  }

  if (primaryRes) return primaryRes;
  throw primaryError || new Error(`Request to ${path} failed`);
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface UploadResponse {
  document_id: string;
  text_preview: string;
  full_text: string;
  page_count?: number;
}

export interface SimplifyResponse {
  document_type: string;
  plain_summary: string;
  key_points: string[];
  language: string;
}

export interface Clause {
  clause_text: string;
  category: string;
  explanation: string;
  category_level?: string; // "standard" | "attention" | "risk"
}

export interface RiskResponse {
  clauses: Clause[];
  language: string;
}

export interface QAResponse {
  answer: string;
  source_excerpt: string;
  confidence: 'high' | 'medium' | 'low';
  document_id: string;
  question: string;
  language: string;
}

export interface ComparisonPoint {
  aspect: string;
  document_a_value: string;
  document_b_value: string;
  more_favorable: 'a' | 'b' | 'document_a' | 'document_b' | 'neutral' | 'neither' | string;
  note?: string;
  explanation?: string;
}

export interface CompareResponse {
  comparison_points: ComparisonPoint[];
  overall_summary: string;
  language?: string;
}

export interface ChecklistResponse {
  before_signing_checklist: string[];
  questions_to_ask: string[];
  document_id?: string;
  language: string;
}

// ── API helpers ───────────────────────────────────────────────────────────

export async function uploadFile(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await resilientFetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Upload failed (${res.status})`);
  }
  return res.json();
}

export async function uploadText(text: string): Promise<UploadResponse> {
  const res = await resilientFetch('/api/upload-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Text upload failed (${res.status})`);
  }
  return res.json();
}

export async function simplifyDocument(
  document_id: string,
  full_text: string,
  language = 'en',
): Promise<SimplifyResponse> {
  const res = await resilientFetch('/api/simplify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id, full_text, language }),
  });
  if (!res.ok) throw new Error(`Simplify failed (${res.status})`);
  return res.json();
}

export async function analyzeRisk(
  document_id: string,
  full_text: string,
  language = 'en',
): Promise<RiskResponse> {
  const res = await resilientFetch('/api/analyze-risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id, full_text, language }),
  });
  if (!res.ok) throw new Error(`Risk analysis failed (${res.status})`);
  return res.json();
}

export async function askQuestion(
  document_id: string,
  question: string,
  language = 'en',
): Promise<QAResponse> {
  const res = await resilientFetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id, question, language }),
  });
  if (!res.ok) throw new Error(`Q&A failed (${res.status})`);
  return res.json();
}

export async function compareDocuments(
  text_a: string,
  text_b: string,
  language = 'en',
): Promise<CompareResponse> {
  const res = await resilientFetch('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text_a, text_b, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Comparison failed (${res.status})`);
  }
  return res.json();
}

export async function generateChecklist(
  document_id: string,
  full_text = '',
  risk_clauses: Clause[] = [],
  language = 'en',
): Promise<ChecklistResponse> {
  const res = await resilientFetch('/api/checklist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id, full_text, risk_clauses, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Checklist failed (${res.status})`);
  }
  return res.json();
}
