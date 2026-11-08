import './globals.css';
import type { Metadata } from 'next';
import { SiteBackground } from '@/components/site-background';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Godwin Azu | Fine Art & Graphite Studio',
  description: 'Portfolio, gallery, digital storefront, and commissions for Godwin Azu.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        <div className="site-shell">
          <SiteBackground />
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
