import { NextRequest, NextResponse } from 'next/server';
import { storeDocument } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ detail: 'No file uploaded.' }, { status: 400 });
    }

    let extractedText = '';
    let pageCount = 1;

    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      try {
        // Use pdf-parse for PDF text extraction
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(buffer);
        extractedText = data.text || '';
        pageCount = data.numpages || 1;
      } catch {
        // Fallback: extract printable strings from raw buffer if parser fails
        const raw = buffer.toString('latin1');
        const matches = raw.match(/[A-Za-z0-9 .,;:'"?!@#$%^&*()_+\-=\[\]{}|\/<>]{4,}/g);
        extractedText = matches ? matches.join(' ') : '';
      }
    } else {
      extractedText = buffer.toString('utf-8');
    }

    const cleanText = extractedText.trim();
    if (!cleanText || cleanText.length < 10) {
      return NextResponse.json(
        { detail: 'Could not extract text from document. Ensure it contains machine-readable text.' },
        { status: 400 }
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
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
