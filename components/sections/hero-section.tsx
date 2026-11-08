'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import portraitImage from '@/app/assets/potrait.jpeg';

export function HeroSection({ featuredArtwork }: { featuredArtwork?: { title: string; image: string } }) {
  return (
    <section className="container-shell grid gap-12 py-12 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      {/* Responsive tweaks: stack on mobile, tighten spacing */}
      <div>
        <div className="mb-5 flex items-center gap-2 text-[var(--muted)]">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          <span className="label">Fine graphite artist</span>
        </div>
        <h1 className="max-w-xl text-4xl leading-[1.05] tracking-[-0.06em] md:text-7xl md:leading-[0.9]">
          Drawing life into every quiet detail.
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-[var(--muted)]">
          Godwin Azu creates graphite studies and original works that balance realism, emotion, and tactile paper grain. Each composition is built with patience, observation, and a belief in the power of subtle detail.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <Button asChild>
            <Link href="/gallery">
              View selected works
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/commissions">Book a commission</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/store">Shop originals</Link>
          </Button>
        </div>
        <div className="mt-8 grid max-w-xl gap-6 sm:grid-cols-3">
          {[{ value: '12+', label: 'Years of drawing' }, { value: '84', label: 'Featured works' }, { value: '4.9', label: 'Collector rating' }].map((item) => (
            <div key={item.label}>
              <p className="text-3xl font-semibold tracking-tight">{item.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="panel relative overflow-hidden border-[1.5px] p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(230,194,128,0.22),transparent_30%)]" />
          <div className="relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)]">
            {featuredArtwork ? (
              <Image
                src={featuredArtwork.image}
                alt={featuredArtwork.title}
                width={1200}
                height={1400}
                className="h-[620px] w-full object-cover"
              />
            ) : (
              <Image
                src={portraitImage}
                alt="Graphite portrait by Godwin Azu"
                priority
                className="h-[620px] w-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
