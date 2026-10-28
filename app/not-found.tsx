import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container-shell py-24 text-center">
      <p className="label mb-4">404</p>
      <h1 className="mb-4 text-4xl font-semibold">This page is not in the studio.</h1>
      <p className="mx-auto max-w-xl text-sm text-[var(--muted)]">
        The artwork you are looking for may have been archived or moved.
      </p>
      <Link href="/" className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white dark:text-[#111113]">
        Return home
      </Link>
    </main>
  );
}
