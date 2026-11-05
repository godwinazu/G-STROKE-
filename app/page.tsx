import { ArtworksShowcase } from '@/components/sections/artworks-showcase';
import { CommissionsEstimator } from '@/components/sections/commissions-estimator';
import { HeroSection } from '@/components/sections/hero-section';
import { ShopSection } from '@/components/sections/shop-section';
import { ToolsShelf } from '@/components/sections/tools-shelf';
import { formatMoney } from '@/lib/money';
import { getPublishedArtworks } from '@/lib/artworks';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const publishedWorks = await getPublishedArtworks();
  const galleryWorks = publishedWorks.map((work) => ({
    title: work.title,
    category: work.category,
    image: work.image,
    description: work.description,
    price: formatMoney(Number(work.price)),
  }));

  return (
    <>
      <HeroSection featuredArtwork={publishedWorks.find((work) => work.isFeatured)} />
      <ArtworksShowcase artworks={galleryWorks} />
      <ShopSection />
      <CommissionsEstimator />
      <ToolsShelf />
    </>
  );
}
