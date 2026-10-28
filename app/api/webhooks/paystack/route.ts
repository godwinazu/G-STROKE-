import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyPaystackSignature } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature') ?? undefined;

  const isValid = verifyPaystackSignature(rawBody, signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    if (event === 'charge.success') {
      const ref = data.reference;
      if (process.env.DATABASE_URL) {
        await db.update(orders).set({ status: 'PAID' }).where(eq(orders.paystackReference, ref));
      }
      return NextResponse.json({ received: true, status: 'PAID' });
    }

    return NextResponse.json({ received: true, status: 'ignored' });
  } catch (error) {
    console.error('Paystack webhook error', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
