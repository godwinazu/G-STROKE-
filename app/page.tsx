import { and, desc, eq, isNull } from 'drizzle-orm';
import { ArtworksShowcase } from '@/components/sections/artworks-showcase';
import { CommissionsEstimator } from '@/components/sections/commissions-estimator';
import { HeroSection } from '@/components/sections/hero-section';
import { ShopSection } from '@/components/sections/shop-section';
import { ToolsShelf } from '@/components/sections/tools-shelf';
import { db } from '@/lib/db';
import { artworks } from '@/lib/schema';
import { formatMoney } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const publishedWorks = process.env.DATABASE_URL
    ? await db.select({
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
    : [];

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
