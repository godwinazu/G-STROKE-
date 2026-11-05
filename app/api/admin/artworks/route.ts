import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { artworks } from '@/lib/schema';
import { isAdminCookieHeader } from '@/lib/admin';

const artworkSchema = z.object({
  title: z.string().min(2).max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().min(2).max(120),
  medium: z.string().min(2).max(120),
  size: z.string().min(1).max(120),
  description: z.string().min(10).max(5000),
  imageKey: z.string().min(1).max(500).optional(),
  price: z.number().nonnegative(),
  isFeatured: z.boolean().default(false),
  isDigital: z.boolean().default(false),
  digitalFileKey: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  if (!isAdminCookieHeader(request.headers.get('cookie'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = artworkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid artwork details' }, { status: 400 });

  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '');
  if (!publicBaseUrl) return NextResponse.json({ error: 'R2_PUBLIC_BASE_URL is not configured' }, { status: 503 });
  if (!parsed.data.imageKey) return NextResponse.json({ error: 'Upload an artwork image first' }, { status: 400 });

  try {
    const value = parsed.data;
    await db.insert(artworks).values({
      title: value.title,
      slug: value.slug,
      category: value.category,
      medium: value.medium,
      size: value.size,
      description: value.description,
      r2ImageUrl: `${publicBaseUrl}/${value.imageKey}`,
      price: String(value.price),
      isFeatured: value.isFeatured,
      isDigital: value.isDigital,
      r2DigitalFileKey: value.isDigital ? value.digitalFileKey || null : null,
      ...(value.imageKey && process.env.R2_PUBLIC_BASE_URL ? { r2ImageUrl: `${process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${value.imageKey}` } : {}),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Artwork create error', error);
    return NextResponse.json({ error: 'Unable to save artwork. Check that the slug is unique.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isAdminCookieHeader(request.headers.get('cookie'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = z.discriminatedUnion('action', [
    z.object({ id: z.number().int().positive(), action: z.enum(['archive', 'restore', 'hide', 'show']) }),
    z.object({ id: z.number().int().positive(), action: z.literal('edit'), artwork: artworkSchema }),
  ]).safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: 'Invalid artwork action' }, { status: 400 });

  const { id, action } = payload.data;
  if (action === 'edit') {
    const value = payload.data.artwork;
    await db.update(artworks).set({
      title: value.title,
      slug: value.slug,
      category: value.category,
      medium: value.medium,
      size: value.size,
      description: value.description,
      price: String(value.price),
      isFeatured: value.isFeatured,
      isDigital: value.isDigital,
      r2DigitalFileKey: value.isDigital ? value.digitalFileKey || null : null,
    }).where(eq(artworks.id, id));
    return NextResponse.json({ success: true });
  }

  await db.update(artworks).set({
    ...(action === 'archive' ? { archivedAt: new Date(), isVisible: false } : {}),
    ...(action === 'restore' ? { archivedAt: null, isVisible: true } : {}),
    ...(action === 'hide' ? { isVisible: false } : {}),
    ...(action === 'show' ? { isVisible: true } : {}),
  }).where(eq(artworks.id, id));

  return NextResponse.json({ success: true });
}