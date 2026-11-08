'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

type Download = { name: string; url: string };

export function CheckoutDownloads({ reference }: { reference: string }) {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [message, setMessage] = useState('Confirming your payment…');

  useEffect(() => {
    if (!reference) {
      setMessage('No payment reference was provided.');
      return;
    }

    fetch(`/api/orders/${encodeURIComponent(reference)}/downloads`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Payment is still processing. Refresh this page shortly.');
        setDownloads(result.downloads);
        setMessage('Your payment is confirmed.');
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Unable to confirm your payment yet.');
      });
  }, [reference]);

  return (
    <section className="mx-auto max-w-2xl">
      <p className="label">Order status</p>
      <h1 className="mt-3 text-4xl">Thank you for collecting a piece of the studio.</h1>
      <p aria-live="polite" className="mt-5 text-[var(--muted)]">{message}</p>
      {downloads.length > 0 && (
        <ul className="mt-8 space-y-3">
          {downloads.map((download) => (
            <li key={download.name}>
              <a
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white shadow-[0_0.7em_1.5em_-0.5em_var(--accent)] transition-shadow hover:shadow-[0_0.5em_1.5em_-0.5em_var(--accent)] active:shadow-[0_0.3em_1em_-0.5em_var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                href={download.url}
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                Download {download.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}