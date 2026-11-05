'use client';

import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/money';

type Artwork = {
  id: number;
  title: string;
  slug: string;
  category: string;
  medium: string;
  size: string;
  description: string;
  price: string;
  isFeatured: boolean;
  isDigital: boolean;
  r2DigitalFileKey: string | null;
  isVisible: boolean;
  archivedAt: string | null;
};

type Order = {
  id: number;
  paystackReference: string;
  customerEmail: string;
  totalAmount: string;
  currency: string;
  status: string;
  orderType: string;
  shippingStatus: string;
};

type Commission = {
  id: number;
  customerName: string;
  email: string;
  subjectType: string;
  budgetEstimate: number;
  status: string;
};

type DashboardData = {
  stats: { revenue: number; paidOrders: number; downloads: number };
  analytics: {
    revenueByDay: { label: string; revenue: number }[];
    topSelling: { name: string; quantity: number }[];
  };
  orders: Order[];
  commissions: Commission[];
  artworks: Artwork[];
};

const emptyArtwork = {
  title: '',
  slug: '',
  category: 'Portraits',
  medium: 'Graphite',
  size: 'A3',
  description: '',
  price: '',
  isFeatured: false,
  isDigital: false,
  digitalFileKey: '',
};

export function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [artwork, setArtwork] = useState(emptyArtwork);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    const response = await fetch('/api/admin/data', { cache: 'no-store' });
    if (response.status === 401) {
      router.replace('/admin/login');
      return;
    }
    if (response.ok) setData(await response.json());
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function uploadArtwork(event: ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!imageFile && editingId === null) {
      setNotice('Choose an artwork scan first.');
      return;
    }

    setBusy(true);
    setNotice('Uploading scan…');
    try {
      async function uploadFile(file: File, kind: 'image' | 'digital') {
        const signedResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', kind }),
        });
        const signed = await signedResponse.json();
        if (!signedResponse.ok) throw new Error(signed.error || 'Could not prepare the upload.');

        const uploadResponse = await fetch(signed.url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!uploadResponse.ok) throw new Error('R2 rejected the file upload. Check the bucket CORS policy.');
        return signed.key as string;
      }

      const imageKey = imageFile ? await uploadFile(imageFile, 'image') : undefined;
      const digitalFileKey = digitalFile ? await uploadFile(digitalFile, 'digital') : artwork.digitalFileKey;

      const saveResponse = await fetch('/api/admin/artworks', {
        method: editingId === null ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId === null
          ? { ...artwork, digitalFileKey, price: Number(artwork.price), imageKey }
          : { id: editingId, action: 'edit', artwork: { ...artwork, digitalFileKey, price: Number(artwork.price), imageKey } }),
      });
      const saved = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(saved.error || 'Could not save artwork details.');

      setArtwork(emptyArtwork);
      setImageFile(null);
      setDigitalFile(null);
      setEditingId(null);
      setNotice(editingId === null ? 'Artwork saved.' : 'Artwork updated.');
      await loadData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Artwork upload failed.');
    } finally {
      setBusy(false);
    }
  }

  async function updateArtwork(id: number, action: 'archive' | 'restore' | 'hide' | 'show') {
    const response = await fetch('/api/admin/artworks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    if (response.ok) await loadData();
  }

  function editArtwork(item: Artwork) {
    setEditingId(item.id);
    setArtwork({
      title: item.title,
      slug: item.slug,
      category: item.category,
      medium: item.medium,
      size: item.size,
      description: item.description,
      price: item.price,
      isFeatured: item.isFeatured,
      isDigital: item.isDigital,
      digitalFileKey: item.r2DigitalFileKey || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function updateRecord(type: 'shipping' | 'commission', id: number, status: string) {
    const response = await fetch('/api/admin/records', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, status }),
    });
    if (response.ok) await loadData();
  }

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <main className="container-shell py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="label">Admin area</p>
          <h1 className="mt-3 text-4xl">Studio operations</h1>
        </div>
        <button type="button" onClick={logout} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">Sign out</button>
      </div>

      {!data ? <p className="text-[var(--muted)]">Loading studio data…</p> : (
        <>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { label: 'Paid revenue', value: formatMoney(data.stats.revenue) },
              { label: 'Paid orders', value: data.stats.paidOrders.toLocaleString() },
              { label: 'Download requests', value: data.stats.downloads.toLocaleString() },
            ].map((item) => (
              <div key={item.label} className="panel p-6">
                <p className="label">{item.label}</p>
                <p className="mt-4 text-3xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          <section className="panel mt-8 grid gap-8 p-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <p className="label">Sales · last seven days</p>
              <div className="mt-6 grid h-48 grid-cols-7 items-end gap-3" role="img" aria-label="Daily paid revenue for the last seven days">
                {data.analytics.revenueByDay.map((day) => {
                  const peak = Math.max(...data.analytics.revenueByDay.map((entry) => entry.revenue), 1);
                  return (
                    <div key={day.label} className="flex h-full flex-col items-center justify-end gap-2">
                      <div title={formatMoney(day.revenue)} className="w-full max-w-10 rounded-t bg-[var(--accent)]" style={{ height: `${Math.max((day.revenue / peak) * 100, 3)}%` }} />
                      <span className="text-[10px] text-[var(--muted)]">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="label">Top sellers</p>
              <ol className="mt-5 space-y-4">
                {data.analytics.topSelling.map((item, index) => (
                  <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                    <span><span className="mr-3 text-[var(--muted)]">0{index + 1}</span>{item.name}</span>
                    <span className="text-[var(--muted)]">{item.quantity}</span>
                  </li>
                ))}
                {!data.analytics.topSelling.length && <li className="text-sm text-[var(--muted)]">Sales will appear here.</li>}
              </ol>
            </div>
          </section>

          <section className="panel mt-8 p-6">
            <p className="label">Add artwork</p>
            <form onSubmit={uploadArtwork} className="mt-5 grid gap-3 md:grid-cols-2">
              <input required value={artwork.title} onChange={(event) => setArtwork({ ...artwork, title: event.target.value, slug: artwork.slug || event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} placeholder="Title" className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm" />
              <input required value={artwork.slug} onChange={(event) => setArtwork({ ...artwork, slug: event.target.value })} placeholder="URL slug" className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm" />
              <select value={artwork.category} onChange={(event) => setArtwork({ ...artwork, category: event.target.value })} className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm">
                {['Portraits', 'Wildlife', 'Still Life', 'Fine Detail', 'Digital Works'].map((category) => <option key={category}>{category}</option>)}
              </select>
              <input required value={artwork.medium} onChange={(event) => setArtwork({ ...artwork, medium: event.target.value })} placeholder="Medium" className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm" />
              <input required value={artwork.size} onChange={(event) => setArtwork({ ...artwork, size: event.target.value })} placeholder="Size" className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm" />
              <input required type="number" min="0" step="0.01" value={artwork.price} onChange={(event) => setArtwork({ ...artwork, price: event.target.value })} placeholder="Price" className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm" />
              <textarea required minLength={10} value={artwork.description} onChange={(event) => setArtwork({ ...artwork, description: event.target.value })} placeholder="Description" rows={3} className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm md:col-span-2" />
              <input required={editingId === null} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] || null)} className="text-sm md:col-span-2" />
              <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <input type="checkbox" checked={artwork.isFeatured} onChange={(event) => setArtwork({ ...artwork, isFeatured: event.target.checked })} /> Featured artwork
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <input type="checkbox" checked={artwork.isDigital} onChange={(event) => setArtwork({ ...artwork, isDigital: event.target.checked })} /> Digital product
              </label>
              {artwork.isDigital && <>
                <input type="file" accept="application/pdf,application/zip,application/x-zip-compressed" onChange={(event) => setDigitalFile(event.target.files?.[0] || null)} className="text-sm md:col-span-2" />
                <p className="text-xs text-[var(--muted)] md:col-span-2">{artwork.digitalFileKey ? `Private download attached: ${artwork.digitalFileKey}` : 'Upload a PDF or ZIP file to attach the private download.'}</p>
              </>}
              <div className="flex gap-3 md:col-span-2">
                <button disabled={busy} className="flex-1 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white disabled:opacity-60 dark:text-[#111113]">{busy ? 'Saving…' : editingId === null ? 'Upload and publish artwork' : 'Save artwork changes'}</button>
                {editingId !== null && <button type="button" onClick={() => { setEditingId(null); setArtwork(emptyArtwork); setImageFile(null); setDigitalFile(null); }} className="rounded-full border border-[var(--border)] px-5 py-3 text-sm">Cancel edit</button>}
              </div>
            </form>
            {notice && <p aria-live="polite" className="mt-3 text-sm text-[var(--muted)]">{notice}</p>}
          </section>

          <section className="panel mt-8 overflow-hidden">
            <div className="border-b border-[var(--border)] p-6"><p className="label">Artwork inventory</p></div>
            <div className="divide-y divide-[var(--border)]">
              {data.artworks.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div><p className="font-medium">{item.title}</p><p className="text-xs text-[var(--muted)]">{item.category} · {formatMoney(Number(item.price))} · {item.archivedAt ? 'Archived' : item.isVisible ? 'Visible' : 'Hidden'}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => editArtwork(item)} className="rounded-full border border-[var(--border)] px-3 py-2 text-xs">Edit</button>
                    {!item.archivedAt && <button onClick={() => updateArtwork(item.id, item.isVisible ? 'hide' : 'show')} className="rounded-full border border-[var(--border)] px-3 py-2 text-xs">{item.isVisible ? 'Hide' : 'Show'}</button>}
                    <button onClick={() => updateArtwork(item.id, item.archivedAt ? 'restore' : 'archive')} className="rounded-full border border-[var(--border)] px-3 py-2 text-xs">{item.archivedAt ? 'Restore' : 'Archive'}</button>
                  </div>
                </div>
              ))}
              {!data.artworks.length && <p className="p-6 text-sm text-[var(--muted)]">No artwork records yet.</p>}
            </div>
          </section>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <section className="panel overflow-hidden">
              <div className="border-b border-[var(--border)] p-6"><p className="label">Orders</p></div>
              <div className="divide-y divide-[var(--border)]">
                {data.orders.map((order) => (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div><p className="font-medium">{order.customerEmail}</p><p className="text-xs text-[var(--muted)]">{order.paystackReference} · {order.status} · {order.currency} {order.totalAmount}</p></div>
                    {order.orderType === 'PHYSICAL' && order.status !== 'PENDING' && <select aria-label="Shipping status" value={order.shippingStatus} onChange={(event) => updateRecord('shipping', order.id, event.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs">{['UNFULFILLED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => <option key={status}>{status}</option>)}</select>}
                  </div>
                ))}
                {!data.orders.length && <p className="p-6 text-sm text-[var(--muted)]">No orders yet.</p>}
              </div>
            </section>

            <section className="panel overflow-hidden">
              <div className="border-b border-[var(--border)] p-6"><p className="label">Commission inquiries</p></div>
              <div className="divide-y divide-[var(--border)]">
                {data.commissions.map((commission) => (
                  <div key={commission.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div><p className="font-medium">{commission.customerName} · {commission.subjectType}</p><p className="text-xs text-[var(--muted)]">{commission.email} · estimated {formatMoney(commission.budgetEstimate)} · {commission.status}</p></div>
                    <select aria-label="Commission status" value={commission.status} onChange={(event) => updateRecord('commission', commission.id, event.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs">{['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'].map((status) => <option key={status}>{status}</option>)}</select>
                  </div>
                ))}
                {!data.commissions.length && <p className="p-6 text-sm text-[var(--muted)]">No inquiries yet.</p>}
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
