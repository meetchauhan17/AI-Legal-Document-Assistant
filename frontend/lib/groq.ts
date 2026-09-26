/**
 * @fileoverview Groq AI Client for Next.js Serverless API Routes.
 *
 * Provides a typed, reusable fetch wrapper for the Groq Cloud inference API
 * and a JSON sanitiser for model responses.
 *
 * Configuration:
 *   - Set GROQ_API_KEY in your `.env.local` (local dev) or Vercel environment variables (production).
 *   - Set GROQ_MODEL to override the default model (optional).
 */

/** The Groq API key sourced exclusively from environment variables. */
export const GROQ_API_KEY: string = process.env.GROQ_API_KEY ?? '';

/** The Groq model identifier to use for all inference calls. */
export const GROQ_MODEL: string = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

/** Groq Chat Completion message shape. */
export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Sends a chat completion request to the Groq Cloud API.
 *
 * @param messages   - Ordered list of conversation messages.
 * @param jsonMode   - When `true`, instructs the model to respond in strict JSON format.
 * @param temperature - Sampling temperature (0 = deterministic, 1 = creative). Default: 0.1.
 * @returns The model's text response content.
 * @throws Error if GROQ_API_KEY is not configured or if the API returns a non-2xx status.
 */
export async function callGroq(
  messages: GroqMessage[],
  jsonMode: boolean = false,
  temperature: number = 0.1,
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not configured.');
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
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

  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? '';
}

/**
 * Safely parses a raw model text response into a typed JSON object.
 *
 * Handles markdown code-fence stripping (`\`\`\`json ... \`\`\``) before parsing.
 *
 * @param rawText  - The raw text from the model response.
 * @param fallback - Value returned when parsing fails.
 * @returns Parsed JSON of type `T`, or `fallback` on any error.
 */
export function cleanJson<T>(rawText: string, fallback: T): T {
  try {
    let text = rawText.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}
