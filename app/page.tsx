import Link from 'next/link';
import { HeroSection } from '@/components/sections/hero-section';
import { ToolsShelf } from '@/components/sections/tools-shelf';
import { formatMoney } from '@/lib/money';
import { getPublishedArtworks } from '@/lib/artworks';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const publishedWorks = await getPublishedArtworks();
  const featuredArtwork = publishedWorks.find((work) => work.isFeatured) ?? publishedWorks[0];

  return (
    <>
      <HeroSection featuredArtwork={featuredArtwork ? { title: featuredArtwork.title, image: featuredArtwork.image } : undefined} />

      <section className="container-shell py-10 md:py-16">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { href: '/gallery', title: 'Gallery', note: 'Selected works and graphite studies.' },
            { href: '/store', title: 'Store', note: 'Originals, prints, and digital tools.' },
            { href: '/commissions', title: 'Commissions', note: 'Estimate pricing for custom work.' },
            { href: '/about', title: 'About', note: 'The studio philosophy and process.' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="panel block p-6 transition hover:-translate-y-0.5">
              <p className="label">Explore</p>
              <h3 className="mt-3 text-2xl font-medium">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.note}</p>
            </Link>
          ))}
        </div>

        {featuredArtwork && (
          <div className="mt-12 flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="label">Featured artwork</p>
              <h3 className="mt-3 text-3xl font-medium">{featuredArtwork.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{featuredArtwork.category}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold">{formatMoney(Number(featuredArtwork.price))}</span>
              <Button asChild>
                <Link href="/gallery">Browse gallery</Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      <ToolsShelf />
    </>
  );
}
