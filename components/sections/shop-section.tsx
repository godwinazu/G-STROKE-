'use client';

import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/money';

type Product = { id: string; name: string; type: 'Physical' | 'Digital'; price: number; note: string; imageUrl: string };
type Options = { paperFinish: 'matte' | 'satin'; frame: 'none' | 'black' | 'oak' };
type CartEntry = Product & Options & { quantity: number; cartKey: string; unitPrice: number };

export function ShopSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [productOptions, setProductOptions] = useState<Record<string, Options>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [checkoutError, setCheckoutError] = useState('');
  const [email, setEmail] = useState('');
  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', city: '', country: '' });

  useEffect(() => {
    fetch('/api/store/products')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load products');
        const result = await response.json();
        setProducts(result.products);
      })
      .catch(() => setProducts([]));
  }, []);

  const entries = useMemo(() => Object.entries(cart).flatMap(([cartKey, quantity]): CartEntry[] => {
    const [productId, paperFinish = 'matte', frame = 'none'] = cartKey.split('|');
    const product = products.find((entry) => entry.id === productId);
    if (!product) return [];
    const options: Options = {
      paperFinish: paperFinish === 'satin' ? 'satin' : 'matte',
      frame: frame === 'black' || frame === 'oak' ? frame : 'none',
    };
    const unitPrice = product.price + (product.type === 'Physical' && options.paperFinish === 'satin' ? 15 : 0) + (options.frame === 'black' ? 75 : options.frame === 'oak' ? 95 : 0);
    return [{ ...product, ...options, quantity, cartKey, unitPrice }];
  }), [cart, products]);

  const total = entries.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const hasPhysicalItem = entries.some((item) => item.type === 'Physical');

  const updateQty = (cartKey: string, delta: number) => {
    setCart((current) => {
      const nextQty = (current[cartKey] ?? 0) + delta;
      if (nextQty <= 0) {
        const next = { ...current };
        delete next[cartKey];
        return next;
      }
      return { ...current, [cartKey]: nextQty };
    });
  };

  const addToCart = (product: Product) => {
    const options = productOptions[product.id] || { paperFinish: 'matte', frame: 'none' };
    const cartKey = `${product.id}|${options.paperFinish}|${options.frame}`;
    setCart((current) => ({ ...current, [cartKey]: (current[cartKey] ?? 0) + 1 }));
    setDrawerOpen(true);
  };

  const checkout = async () => {
    if (!entries.length || !email) return;

    setCheckoutState('loading');
    setCheckoutError('');

    const payload = {
      email,
      items: entries.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        ...(item.type === 'Physical' ? { paperFinish: item.paperFinish, frame: item.frame } : {}),
      })),
      ...(hasPhysicalItem ? { shippingAddress: shipping } : {}),
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.authorizationUrl) {
        throw new Error(result.error || 'Unable to start checkout.');
      }

      window.location.assign(result.authorizationUrl);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to start checkout.');
      setCheckoutState('idle');
    }
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
              <img src={product.imageUrl} alt={product.name} className="mb-5 h-52 w-full rounded-xl object-cover" />
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {product.type}
                </span>
                <span className="text-xl font-semibold">{formatMoney(product.price)}</span>
              </div>
              <h3 className="text-2xl">{product.name}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{product.note}</p>
              {product.type === 'Physical' && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <label className="text-xs text-[var(--muted)]">Paper finish
                    <select value={productOptions[product.id]?.paperFinish || 'matte'} onChange={(event) => setProductOptions({ ...productOptions, [product.id]: { ...(productOptions[product.id] || { paperFinish: 'matte', frame: 'none' }), paperFinish: event.target.value as Options['paperFinish'] } })} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-sm text-[var(--foreground)]"><option value="matte">Archival matte</option><option value="satin">Satin +$15</option></select>
                  </label>
                  <label className="text-xs text-[var(--muted)]">Frame
                    <select value={productOptions[product.id]?.frame || 'none'} onChange={(event) => setProductOptions({ ...productOptions, [product.id]: { ...(productOptions[product.id] || { paperFinish: 'matte', frame: 'none' }), frame: event.target.value as Options['frame'] } })} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-sm text-[var(--foreground)]"><option value="none">Unframed</option><option value="black">Black +$75</option><option value="oak">Oak +$95</option></select>
                  </label>
                </div>
              )}
              <Button className="mt-6 w-full" onClick={() => addToCart(product)}>
                Add to cart
              </Button>
            </article>
          ))}
          {!products.length && <p className="text-sm text-[var(--muted)]">New works are being prepared for the shop.</p>}
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
                  <div key={item.cartKey} className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{item.type}{item.type === 'Physical' ? ` · ${item.paperFinish} · ${item.frame === 'none' ? 'unframed' : `${item.frame} frame`}` : ''}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{formatMoney(item.unitPrice)} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => updateQty(item.cartKey, -1)} className="rounded-full border border-[var(--border)] p-2">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-5 text-center text-sm">{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item.cartKey, 1)} className="rounded-full border border-[var(--border)] p-2">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              {entries.length > 0 && (
                <div className="space-y-3 pt-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email for your receipt"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none"
                  />
                  {hasPhysicalItem && (
                    <>
                      <input required value={shipping.name} onChange={(event) => setShipping({ ...shipping, name: event.target.value })} placeholder="Recipient name" className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none" />
                      <input required value={shipping.phone} onChange={(event) => setShipping({ ...shipping, phone: event.target.value })} placeholder="Phone number" className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none" />
                      <input required value={shipping.address} onChange={(event) => setShipping({ ...shipping, address: event.target.value })} placeholder="Street address" className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none" />
                      <div className="grid grid-cols-2 gap-3">
                        <input required value={shipping.city} onChange={(event) => setShipping({ ...shipping, city: event.target.value })} placeholder="City" className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none" />
                        <input required value={shipping.country} onChange={(event) => setShipping({ ...shipping, country: event.target.value })} placeholder="Country" className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none" />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-[var(--border)] pt-4">
              <div className="mb-4 flex items-center justify-between text-sm text-[var(--muted)]">
                <span>Subtotal</span>
                <span className="text-[var(--foreground)]">{formatMoney(total)}</span>
              </div>
              {checkoutError && <p role="alert" className="mb-3 text-sm text-red-600">{checkoutError}</p>}
              <Button onClick={checkout} disabled={!entries.length || !email || checkoutState === 'loading' || (hasPhysicalItem && Object.values(shipping).some((value) => !value.trim()))} className="w-full">
                {checkoutState === 'loading' ? 'Preparing checkout…' : 'Continue to Paystack'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
