import { NextResponse } from 'next/server';
import { GROQ_MODEL, GROQ_API_KEY } from '@/lib/groq';
import { getSessionCount } from '@/lib/store';

/**
 * GET /api/health
 *
 * Returns runtime health information for the AI Legal Document Assistant backend.
 * Used by monitoring services and the Vercel status dashboard.
 *
 * @returns JSON health payload with session count, Groq configuration, and engine identifier.
 */
export async function GET(): Promise<NextResponse> {
  const sessionCount = getSessionCount();

  return NextResponse.json({
    status: 'healthy',
    active_sessions: sessionCount,
    stored_documents: sessionCount,
    groq_configured: Boolean(GROQ_API_KEY),
    groq_model: GROQ_MODEL,
    engine: 'Next.js Serverless + Groq LLaMA-3.3-70b-versatile',
    timestamp: new Date().toISOString(),
  });
}
