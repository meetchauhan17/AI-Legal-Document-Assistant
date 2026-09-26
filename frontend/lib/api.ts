// Centralised API base URL — reads from env or falls back to localhost
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

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
  const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Upload failed (${res.status})`);
  }
  return res.json();
}

export async function uploadText(text: string): Promise<UploadResponse> {
  const res = await fetch(`${API_BASE}/api/upload-text`, {
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
  const res = await fetch(`${API_BASE}/api/simplify`, {
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
  const res = await fetch(`${API_BASE}/api/analyze-risk`, {
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
  const res = await fetch(`${API_BASE}/api/ask`, {
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
  const res = await fetch(`${API_BASE}/api/compare`, {
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
  const res = await fetch(`${API_BASE}/api/checklist`, {
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


