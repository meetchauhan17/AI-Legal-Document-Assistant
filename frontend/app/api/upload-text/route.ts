import { NextRequest, NextResponse } from 'next/server';
import { storeDocument } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawText = (body.text || '').trim();

    if (!rawText) {
      return NextResponse.json({ detail: 'Pasted text cannot be empty.' }, { status: 400 });
    }

    const document_id = crypto.randomUUID();
    storeDocument(document_id, rawText);

    return NextResponse.json({
      document_id,
      text_preview: rawText.slice(0, 500),
      full_text: rawText,
      page_count: 1,
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Upload failed' }, { status: 500 });
  }
}
