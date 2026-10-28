import { NextResponse } from 'next/server';
import { createR2PresignedUploadUrl } from '@/lib/r2';

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }

    const key = `uploads/${Date.now()}-${filename.replace(/\s+/g, '-')}`;
    const result = await createR2PresignedUploadUrl({ key, contentType });

    return NextResponse.json({ ...result, key });
  } catch (error) {
    console.error('R2 upload error', error);
    return NextResponse.json({ error: 'Unable to create upload URL' }, { status: 500 });
  }
}
