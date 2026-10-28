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
