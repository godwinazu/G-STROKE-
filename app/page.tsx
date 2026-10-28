import { ArtworksShowcase } from '@/components/sections/artworks-showcase';
import { CommissionsEstimator } from '@/components/sections/commissions-estimator';
import { HeroSection } from '@/components/sections/hero-section';
import { ShopSection } from '@/components/sections/shop-section';
import { ToolsShelf } from '@/components/sections/tools-shelf';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ArtworksShowcase />
      <ShopSection />
      <CommissionsEstimator />
      <ToolsShelf />
    </>
  );
}
