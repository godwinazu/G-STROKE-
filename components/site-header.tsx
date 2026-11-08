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
  const [navOpen, setNavOpen] = useState(false);

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

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav toggle */}
        <button
          className="md:hidden flex items-center px-2 py-1 border rounded text-[var(--muted)]"
          aria-label="Open navigation"
          onClick={() => setNavOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </Button>
          <Button asChild>
            <Link href="#store">Shop originals</Link>
          </Button>
        </div>
      </div>
      {/* Mobile nav menu */}
      {navOpen && (
        <nav className="md:hidden absolute left-0 right-0 top-20 bg-[color:var(--background)] border-b border-[var(--border)] shadow-lg z-40">
          <div className="flex flex-col items-start gap-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="w-full py-2 text-base text-[var(--muted)] hover:text-[var(--foreground)]"
                onClick={() => setNavOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
