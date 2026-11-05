'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLoginForm() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const response = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      setError('The admin token was not accepted.');
      setSubmitting(false);
      return;
    }

    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="panel w-full max-w-md space-y-5 p-7">
      <div>
        <p className="label">Studio access</p>
        <h1 className="mt-2 text-3xl">Admin sign in</h1>
      </div>
      <label className="block text-sm">
        Admin token
        <input
          type="password"
          autoComplete="current-password"
          required
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--accent)]"
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button disabled={submitting} className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white disabled:opacity-60 dark:text-[#111113]">
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}