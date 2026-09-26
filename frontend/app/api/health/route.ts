import { NextResponse } from 'next/server';
import { GROQ_MODEL, GROQ_API_KEY } from '@/lib/groq';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    active_sessions: 1,
    stored_documents: 1,
    groq_configured: Boolean(GROQ_API_KEY),
    groq_model: GROQ_MODEL,
    engine: 'Next.js Serverless Edge + Groq LLaMA-3.3-70b-versatile',
  });
}
