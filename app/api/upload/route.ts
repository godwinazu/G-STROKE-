import { NextResponse } from 'next/server';
import { createR2PresignedUploadUrl } from '@/lib/r2';
import { isAdminCookieHeader } from '@/lib/admin';

export async function POST(request: Request) {
  try {
    if (!isAdminCookieHeader(request.headers.get('cookie'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, contentType, kind = 'image' } = await request.json();
    const allowedTypes = kind === 'digital'
      ? ['application/pdf', 'application/zip', 'application/x-zip-compressed', 'application/octet-stream']
      : ['image/jpeg', 'image/png', 'image/webp'];

    if (
      typeof filename !== 'string' ||
      filename.length > 180 ||
      !/^[\w.-]+$/.test(filename) ||
      !allowedTypes.includes(contentType) ||
      !['image', 'digital'].includes(kind)
    ) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }

    const bucketName = kind === 'digital' ? process.env.R2_BUCKET_NAME : process.env.R2_PUBLIC_BUCKET_NAME;
    if (!bucketName) return NextResponse.json({ error: 'The requested R2 bucket is not configured' }, { status: 503 });

    const key = `${kind === 'digital' ? 'digital' : 'artworks'}/${Date.now()}-${filename}`;
    const result = await createR2PresignedUploadUrl({ key, contentType, bucketName });

    return NextResponse.json({ ...result, key });
  } catch (error) {
    console.error('R2 upload error', error);
    return NextResponse.json({ error: 'Unable to create upload URL' }, { status: 500 });
  }
}
