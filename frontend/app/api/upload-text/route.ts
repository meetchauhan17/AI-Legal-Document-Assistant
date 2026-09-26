import { NextRequest, NextResponse } from 'next/server';
import { storeDocument } from '@/lib/store';

/**
 * POST /api/upload-text
 *
 * Accepts a raw legal document text body, assigns it a unique session ID,
 * persists it in the in-memory document store, and returns the session metadata.
 *
 * @body `{ text: string }` — Raw document text (required, non-empty).
 * @returns `UploadResponse` with `document_id`, `text_preview`, `full_text`, and `page_count`.
 * @throws 400 if `text` is missing or empty.
 * @throws 500 on unexpected internal errors.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const rawText = (typeof body.text === 'string' ? body.text : '').trim();

    if (!rawText) {
      return NextResponse.json(
        { detail: 'Pasted text cannot be empty.' },
        { status: 400 },
      );
    }

    const document_id = crypto.randomUUID();
    storeDocument(document_id, rawText);

    return NextResponse.json({
      document_id,
      text_preview: rawText.slice(0, 500),
      full_text: rawText,
      page_count: 1,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
