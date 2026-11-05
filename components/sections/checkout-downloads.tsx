'use client';

import { useEffect, useState } from 'react';

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
              <a className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white dark:text-[#111113]" href={download.url}>
                Download {download.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}