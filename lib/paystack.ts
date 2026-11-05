import crypto from 'crypto';

export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export function verifyPaystackSignature(rawBody: string, signature: string | undefined) {
  if (!signature || !PAYSTACK_SECRET_KEY) {
    return false;
  }

  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
  const provided = Buffer.from(signature, 'hex');
  const expected = Buffer.from(hash, 'hex');

  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, provided);
}

export function createPaystackCheckoutUrl() {
  return 'https://api.paystack.co/transaction/initialize';
}

export async function verifyPaystackTransaction(reference: string) {
  if (!PAYSTACK_SECRET_KEY) return null;

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;

  const result = await response.json();
  return result.status && result.data?.status === 'success' ? result.data : null;
}
