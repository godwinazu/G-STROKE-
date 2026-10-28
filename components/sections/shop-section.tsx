'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const products = [
  { id: 'portrait-print', name: 'Archival Portrait Print', type: 'Physical', price: 180, note: 'Museum rag paper · signed' },
  { id: 'wildlife-bundle', name: 'Wildlife Study Bundle', type: 'Digital', price: 64, note: 'High-res JPG + printable set' },
  { id: 'graphite-brush-pack', name: 'Graphite Brush Pack', type: 'Digital', price: 29, note: 'Custom brushes and textures' },
];

export function ShopSection() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'success'>('idle');

  const entries = useMemo(
    () =>
      products
        .filter((product) => cart[product.id])
        .map((product) => ({ ...product, quantity: cart[product.id] })),
    [cart]
  );

  const total = entries.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const updateQty = (productId: string, delta: number) => {
    setCart((current) => {
      const nextQty = (current[productId] ?? 0) + delta;
      if (nextQty <= 0) {
        const { [productId]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [productId]: nextQty };
    });
  };

  const addToCart = (productId: string) => {
    setCart((current) => ({ ...current, [productId]: (current[productId] ?? 0) + 1 }));
    setDrawerOpen(true);
  };

  const checkout = async () => {
    if (!entries.length) return;

    setCheckoutState('loading');

    const payload = {
      email: 'collector@example.com',
      amount: total,
      reference: `GST-${Date.now()}`,
      orderType: 'PHYSICAL',
      metadata: {
        items: entries.map((item) => ({ name: item.name, qty: item.quantity, price: item.price })),
      },
    };

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setCheckoutState('success');
      setCart({});
      return;
    }

    setCheckoutState('idle');
  };

  return (
    <section id="store" className="bg-[var(--card)]/80 py-20">
      <div className="container-shell">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="label">Digital storefront</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Collect originals and studio tools</h2>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
          >
            <ShoppingBag className="h-4 w-4" />
            Cart ({entries.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="panel p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {product.type}
                </span>
                <span className="text-xl font-semibold">${product.price}</span>
              </div>
              <h3 className="text-2xl">{product.name}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{product.note}</p>
              <Button className="mt-6 w-full" onClick={() => addToCart(product.id)}>
                Add to cart
              </Button>
            </article>
          ))}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0f0f11]/60 p-4 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-2xl">Checkout</h3>
              <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-full border border-[var(--border)] p-2">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              {entries.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">Your cart is empty. Add one of the studio pieces to continue.</p>
              ) : (
                entries.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{item.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => updateQty(item.id, -1)} className="rounded-full border border-[var(--border)] p-2">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-5 text-center text-sm">{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item.id, 1)} className="rounded-full border border-[var(--border)] p-2">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 border-t border-[var(--border)] pt-4">
              <div className="mb-4 flex items-center justify-between text-sm text-[var(--muted)]">
                <span>Subtotal</span>
                <span className="text-[var(--foreground)]">${total}</span>
              </div>
              <Button onClick={checkout} disabled={!entries.length || checkoutState === 'loading'} className="w-full">
                {checkoutState === 'loading' ? 'Preparing checkout…' : checkoutState === 'success' ? 'Checkout ready' : 'Checkout with Paystack'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
