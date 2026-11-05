import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { artworks } from '@/lib/schema';
import { isMissingDatabaseRelation } from '@/lib/database-errors';

export async function getPublishedArtworks() {
  if (!process.env.DATABASE_URL) return [];

  try {
    return await db.select({
      id: artworks.id,
      title: artworks.title,
      slug: artworks.slug,
      category: artworks.category,
      medium: artworks.medium,
      size: artworks.size,
      description: artworks.description,
      price: artworks.price,
      image: artworks.r2ImageUrl,
      isFeatured: artworks.isFeatured,
      isDigital: artworks.isDigital,
      isVisible: artworks.isVisible,
      digitalFileKey: artworks.r2DigitalFileKey,
    }).from(artworks).where(and(
      eq(artworks.isVisible, true),
      isNull(artworks.archivedAt)
    )).orderBy(desc(artworks.createdAt));
  } catch (error) {
    if (!isMissingDatabaseRelation(error)) throw error;
    console.error('Neon schema is not initialized. Run npm run db:push against the DATABASE_URL configured in Vercel.');
    return [];
  }
}