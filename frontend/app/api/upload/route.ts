import { NextRequest, NextResponse } from 'next/server';
import { storeDocument } from '@/lib/store';

/**
 * POST /api/upload
 *
 * Accepts a multipart/form-data file upload (PDF or plain text), extracts the
 * readable text content using `pdf-parse`, and stores the result in the
 * in-memory document session store.
 *
 * @body `FormData` with a `file` field containing the document.
 * @returns `UploadResponse` with `document_id`, `text_preview`, `full_text`, and `page_count`.
 * @throws 400 if no file is provided or if text extraction yields no readable content.
 * @throws 500 on unexpected internal errors.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ detail: 'No file uploaded.' }, { status: 400 });
    }

    let extractedText = '';
    let pageCount = 1;

    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf =
      file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    if (isPdf) {
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(buffer);
        extractedText = data.text ?? '';
        pageCount = data.numpages ?? 1;
      } catch {
        // Graceful fallback: extract printable ASCII characters from raw buffer
        const raw = buffer.toString('latin1');
        const matches = raw.match(/[A-Za-z0-9 .,;:'"?!@#$%^&*()_+\-=[\]{}|/<>]{4,}/g);
        extractedText = matches ? matches.join(' ') : '';
      }
    } else {
      extractedText = buffer.toString('utf-8');
    }

    const cleanText = extractedText.trim();
    if (!cleanText || cleanText.length < 10) {
      return NextResponse.json(
        {
          detail:
            'Could not extract text from the document. Ensure it contains machine-readable (non-scanned) text.',
        },
        { status: 400 },
      );
    }

    const document_id = crypto.randomUUID();
    storeDocument(document_id, cleanText);

    return NextResponse.json({
      document_id,
      text_preview: cleanText.slice(0, 500),
      full_text: cleanText,
      page_count: pageCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'File upload failed';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
