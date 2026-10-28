'use client';

import { useMemo, useState } from 'react';

const pricing = {
  graphite: { portrait: 150, pet: 190, composition: 260 },
  charcoal: { portrait: 210, pet: 260, composition: 340 },
  'colored pencil': { portrait: 240, pet: 300, composition: 390 },
};

const sizeMultipliers = {
  A4: 1,
  A3: 1.5,
  A2: 2.2,
};

export function CommissionsEstimator() {
  const [medium, setMedium] = useState<'graphite' | 'charcoal' | 'colored pencil'>('graphite');
  const [subject, setSubject] = useState<'portrait' | 'pet' | 'composition'>('portrait');
  const [size, setSize] = useState<'A4' | 'A3' | 'A2'>('A4');
  const [form, setForm] = useState({ name: '', email: '', details: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const estimate = useMemo(() => {
    const base = pricing[medium][subject] ?? 180;
    return Math.round(base * (sizeMultipliers[size] ?? 1));
  }, [medium, subject, size]);

  const submitCommission = async () => {
    setStatus('loading');

    const response = await fetch('/api/commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: form.name,
        email: form.email,
        subjectType: subject,
        medium,
        dimensions: size,
        budgetEstimate: estimate,
        details: form.details || 'Commission inquiry from estimator',
      }),
    });

    if (response.ok) {
      setStatus('success');
      setForm({ name: '', email: '', details: '' });
      return;
    }

    setStatus('idle');
  };

  return (
    <section id="commissions" className="container-shell py-20">
      <div className="panel p-6 md:p-10">
        <div className="mb-10 max-w-xl">
          <p className="label">Commission pricing estimator</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Plan your next portrait</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Medium</p>
              <div className="space-y-2">
                {Object.keys(pricing).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMedium(option as keyof typeof pricing)}
                    className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${medium === option ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--foreground)]' : 'border-[var(--border)] text-[var(--muted)]'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Subject</p>
              <div className="space-y-2">
                {['portrait', 'pet', 'composition'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSubject(option as 'portrait' | 'pet' | 'composition')}
                    className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${subject === option ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--foreground)]' : 'border-[var(--border)] text-[var(--muted)]'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Canvas size</p>
              <div className="space-y-2">
                {Object.keys(sizeMultipliers).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option as 'A4' | 'A3' | 'A2')}
                    className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${size === option ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--foreground)]' : 'border-[var(--border)] text-[var(--muted)]'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
            <p className="label">Estimated quote</p>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-5xl font-semibold tracking-tight">${estimate}</span>
              <span className="pb-2 text-sm text-[var(--muted)]">starting from</span>
            </div>
            <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
              Based on your selected medium, subject, and canvas size. Final pricing is confirmed after artwork discussion and reference review.
            </p>

            <div className="mt-6 space-y-3">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Your name"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
              />
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email address"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
              />
              <textarea
                value={form.details}
                onChange={(event) => setForm((current) => ({ ...current, details: event.target.value }))}
                placeholder="Tell me about your vision"
                rows={4}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
              />
            </div>

            <button
              type="button"
              onClick={submitCommission}
              disabled={status === 'loading'}
              className="mt-8 w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white disabled:opacity-70 dark:text-[#111113]"
            >
              {status === 'loading' ? 'Submitting…' : status === 'success' ? 'Inquiry sent' : 'Submit commission inquiry'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
