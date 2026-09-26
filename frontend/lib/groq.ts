/**
 * Groq AI Client & Utilities for Next.js Serverless API routes
 */

export const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_7K66w2Njvmaw0gFHW2fWWGdyb3FYcZkMXuG2rb47PZ56Ov';
export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callGroq(
  messages: GroqMessage[],
  jsonMode: boolean = false,
  temperature: number = 0.1
): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Groq API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export function cleanJson<T>(rawText: string, fallback: T): T {
  try {
    let text = rawText.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
