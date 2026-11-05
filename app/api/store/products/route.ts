import { NextResponse } from 'next/server';
import { getPublishedArtworks } from '@/lib/artworks';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const artworks = await getPublishedArtworks();
    const products = artworks
      .filter((artwork) => !artwork.isDigital || Boolean(artwork.digitalFileKey))
      .map((artwork) => ({
        id: String(artwork.id),
        name: artwork.title,
        category: artwork.category,
        medium: artwork.medium,
        price: Number(artwork.price),
        imageUrl: artwork.image,
        type: artwork.isDigital ? 'Digital' : 'Physical',
        note: `${artwork.medium} · ${artwork.category}`,
      }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Public products error', error);
    return NextResponse.json({ error: 'Unable to load products' }, { status: 500 });
  }
}