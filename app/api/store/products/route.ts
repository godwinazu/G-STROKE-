import { NextResponse } from 'next/server';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { artworks } from '@/lib/schema';
import { isMissingDatabaseRelation } from '@/lib/database-errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json({ products: [] });

  try {
    const products = await db.select({
      id: artworks.id,
      name: artworks.title,
      category: artworks.category,
      medium: artworks.medium,
      price: artworks.price,
      imageUrl: artworks.r2ImageUrl,
      isDigital: artworks.isDigital,
      r2DigitalFileKey: artworks.r2DigitalFileKey,
    }).from(artworks).where(and(
      eq(artworks.isVisible, true),
      isNull(artworks.archivedAt)
    )).orderBy(desc(artworks.createdAt));

    return NextResponse.json({ products: products
      .filter((product) => !product.isDigital || Boolean(product.r2DigitalFileKey))
      .map((product) => ({
      ...product,
      r2DigitalFileKey: undefined,
      id: String(product.id),
      price: Number(product.price),
      type: product.isDigital ? 'Digital' : 'Physical',
      note: `${product.medium} · ${product.category}`,
    })) });
  } catch (error) {
    if (isMissingDatabaseRelation(error)) {
      console.error('Neon schema is not initialized. Run npm run db:push against the DATABASE_URL configured in Vercel.');
      return NextResponse.json({ products: [] });
    }
    console.error('Public products error', error);
    return NextResponse.json({ error: 'Unable to load products' }, { status: 500 });
  }
}