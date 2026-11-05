import { and, desc, eq, isNull } from 'drizzle-orm';
import { ArtworksShowcase } from '@/components/sections/artworks-showcase';
import { CommissionsEstimator } from '@/components/sections/commissions-estimator';
import { HeroSection } from '@/components/sections/hero-section';
import { ShopSection } from '@/components/sections/shop-section';
import { ToolsShelf } from '@/components/sections/tools-shelf';
import { db } from '@/lib/db';
import { artworks } from '@/lib/schema';
import { formatMoney } from '@/lib/money';
import { isMissingDatabaseRelation } from '@/lib/database-errors';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let publishedWorks: {
    title: string;
    category: string;
    price: string;
    image: string;
    description: string;
    isFeatured: boolean;
  }[] = [];

  if (process.env.DATABASE_URL) {
    try {
      publishedWorks = await db.select({
        title: artworks.title,
        category: artworks.category,
        price: artworks.price,
        image: artworks.r2ImageUrl,
        description: artworks.description,
        isFeatured: artworks.isFeatured,
      }).from(artworks).where(and(
        eq(artworks.isVisible, true),
        isNull(artworks.archivedAt)
      )).orderBy(desc(artworks.createdAt))
    } catch (error) {
      if (!isMissingDatabaseRelation(error)) throw error;
      console.error('Neon schema is not initialized. Run npm run db:push against the DATABASE_URL configured in Vercel.');
    }
  }

  return (
    <>
      <HeroSection featuredArtwork={publishedWorks.find((work) => work.isFeatured)} />
      <ArtworksShowcase artworks={publishedWorks.map((work) => ({ ...work, price: formatMoney(Number(work.price)) }))} />
      <ShopSection />
      <CommissionsEstimator />
      <ToolsShelf />
    </>
  );
}
