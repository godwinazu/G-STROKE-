import { ArtworksShowcase } from '@/components/sections/artworks-showcase';
import { formatMoney } from '@/lib/money';
import { getPublishedArtworks } from '@/lib/artworks';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const publishedWorks = await getPublishedArtworks();
  const galleryWorks = publishedWorks.map((work) => ({
    title: work.title,
    category: work.category,
    image: work.image,
    description: work.description,
    price: formatMoney(Number(work.price)),
  }));

  return <ArtworksShowcase artworks={galleryWorks} />;
}
