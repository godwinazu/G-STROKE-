'use client';

import { useMemo, useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

const categories = ['All', 'Portraits', 'Wildlife', 'Still Life', 'Fine Detail', 'Digital Works'];

type ArtworkCard = {
  title: string;
  category: string;
  price: string;
  image: string;
  description: string;
};

export function ArtworksShowcase({ artworks = [] }: { artworks?: ArtworkCard[] }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedWork, setSelectedWork] = useState<ArtworkCard | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const works: ArtworkCard[] = artworks;

  const filteredWorks = useMemo(() => {
    if (activeCategory === 'All') return works;
    return works.filter((work) => work.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="gallery" className="container-shell py-20">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label">Portfolio</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Selected works</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] transition ${
                activeCategory === category
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--foreground)]'
                  : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredWorks.map((work) => (
          <article key={work.title} className="panel overflow-hidden">
            <div className="relative h-80 bg-[var(--card)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),transparent_35%)]" />
              <div className="absolute inset-5 overflow-hidden rounded-[22px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(17,17,19,0.82),rgba(17,17,19,0.25))]">
                <img src={work.image} alt={work.title} className="h-full w-full object-cover opacity-90" />
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="label text-[9px]">{work.category}</p>
                  <h3 className="mt-2 text-xl font-medium">{work.title}</h3>
                </div>
                <span className="text-lg font-semibold">{work.price}</span>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedWork(work); setZoomed(false); }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-transparent px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--accent-soft)]"
              >
                <ZoomIn className="h-4 w-4" />
                Inspect artwork
              </button>
            </div>
          </article>
        ))}
      </div>

      {!filteredWorks.length && <p className="border-t border-[var(--border)] py-10 text-sm text-[var(--muted)]">New work is being prepared for the gallery.</p>}

      {selectedWork && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f0f11]/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedWork(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              aria-label="Close artwork preview"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid md:grid-cols-[1.25fr_0.75fr]">
              <div className="group relative min-h-[420px] overflow-hidden bg-[var(--background)]">
                <button type="button" onClick={() => setZoomed((value) => !value)} aria-label={zoomed ? 'Zoom out artwork' : 'Zoom into artwork'} aria-pressed={zoomed} className="absolute right-4 top-4 z-10 rounded-full border border-white/30 bg-black/60 p-3 text-white backdrop-blur">
                  {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                </button>
                <img src={selectedWork.image} alt={selectedWork.title} className={`h-full min-h-[420px] w-full object-contain transition-transform duration-300 ${zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`} />
              </div>
              <div className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <p className="label">{selectedWork.category}</p>
                  <h3 className="mt-3 text-3xl">{selectedWork.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{selectedWork.description}</p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <span className="text-sm text-[var(--muted)]">Price</span>
                    <span className="text-2xl font-semibold">{selectedWork.price}</span>
                  </div>
                  <button type="button" className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white dark:text-[#111113]">
                    Add to collection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
