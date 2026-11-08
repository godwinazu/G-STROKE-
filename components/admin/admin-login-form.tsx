'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(result?.error || 'Unable to sign in with those credentials.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Unable to reach the sign-in service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel w-full max-w-md space-y-5 p-7">
      <div>
        <p className="label">Studio access</p>
        <h1 className="mt-2 text-3xl">Admin sign in</h1>
      </div>
      <label className="block text-sm">
        Email address
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--accent)]"
        />
      </label>
      <label className="block text-sm">
        Password
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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