'use client';

import { useMemo, useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

const categories = ['All', 'Portraits', 'Wildlife', 'Still Life', 'Fine Detail', 'Digital Works'];

const works = [
  {
    title: 'Quiet Resolve',
    category: 'Portraits',
    price: '$520',
    accent: 'from-amber-200/40 via-transparent to-transparent',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
    description: 'A graphite study exploring stillness, soft shadow, and a patient gaze.',
  },
  {
    title: 'The Watcher',
    category: 'Wildlife',
    price: '$640',
    accent: 'from-zinc-300/40 via-transparent to-transparent',
    image:
      'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80',
    description: 'Wildlife observation built around tension, fur texture, and a disciplined eye.',
  },
  {
    title: 'Paper Bloom',
    category: 'Still Life',
    price: '$480',
    accent: 'from-stone-300/40 via-transparent to-transparent',
    image:
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
    description: 'Still life composition balancing volume, contrast, and paper grain.',
  },
  {
    title: 'Gossamer Steps',
    category: 'Fine Detail',
    price: '$390',
    accent: 'from-yellow-100/40 via-transparent to-transparent',
    image:
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
    description: 'Fine-detail exploration of texture and rhythm in a close observational study.',
  },
  {
    title: 'Nocturne Signal',
    category: 'Digital Works',
    price: '$280',
    accent: 'from-sky-300/30 via-transparent to-transparent',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    description: 'A digital composition translated from the same graphite approach into layered light.',
  },
  {
    title: 'Study in Hush',
    category: 'Portraits',
    price: '$610',
    accent: 'from-orange-200/30 via-transparent to-transparent',
    image:
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1200&q=80',
    description: 'Portrait practice built on soft transitions, rhythm, and tonal restraint.',
  },
];

export function ArtworksShowcase() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedWork, setSelectedWork] = useState<(typeof works)[number] | null>(null);

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
            <div className={`relative h-80 bg-gradient-to-br ${work.accent}`}>
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
                onClick={() => setSelectedWork(work)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-transparent px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--accent-soft)]"
              >
                <ZoomIn className="h-4 w-4" />
                Inspect artwork
              </button>
            </div>
          </article>
        ))}
      </div>

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
              <div className="relative min-h-[420px] bg-[var(--background)]">
                <img src={selectedWork.image} alt={selectedWork.title} className="h-full w-full object-cover" />
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
