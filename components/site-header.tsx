'use client';

import Link from 'next/link';
import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '#gallery', label: 'Gallery' },
  { href: '#store', label: 'Store' },
  { href: '#commissions', label: 'Commissions' },
  { href: '#about', label: 'About' },
];

export function SiteHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color:var(--background)]/80 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-sm font-semibold">
            GA
          </div>
          <div>
            <p className="font-medium tracking-[0.2em] text-[11px] uppercase text-[var(--muted)]">Godwin Azu</p>
            <p className="font-serif text-lg tracking-tight">Studio</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </Button>
          <Button asChild>
            <Link href="#store">Shop originals</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
