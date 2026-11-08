'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SquareLoader } from '@/components/ui/square-loader';

export default function AdminSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteKey, setInviteKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, inviteKey }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Signup failed');
    } else {
      router.push('/admin');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Signup</h1>
        {error && <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>}
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-zinc-800 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            required
            minLength={12}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-zinc-800 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="At least 12 characters"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">Invite Key</label>
          <input
            type="text"
            required
            value={inviteKey}
            onChange={e => setInviteKey(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-zinc-800 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Ask the site owner"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {loading ? <><SquareLoader compact label="Creating admin account" /> Signing up...</> : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
