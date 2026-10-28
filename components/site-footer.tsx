import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]/80">
      <div className="container-shell flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-serif text-2xl">Godwin Azu</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Graphite, charcoal, and fine detail works shaped with patience and observation.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
          <Link href="#gallery">Gallery</Link>
          <Link href="#store">Store</Link>
          <Link href="#commissions">Commissions</Link>
        </div>
      </div>
    </footer>
  );
}
