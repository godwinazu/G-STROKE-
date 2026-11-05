import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyPaystackSignature } from '@/lib/paystack';
import { createR2DownloadUrl } from '@/lib/r2';
import { sendDigitalDeliveryEmail } from '@/lib/email';

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
      if (
        data?.status !== 'success' ||
        typeof data.reference !== 'string' ||
        typeof data.amount !== 'number' ||
        typeof data.currency !== 'string' ||
        !process.env.DATABASE_URL
      ) {
        return NextResponse.json({ error: 'Invalid payment event' }, { status: 400 });
      }

      const [order] = await db.select().from(orders).where(eq(orders.paystackReference, data.reference)).limit(1);
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      const expectedAmount = Math.round(Number(order.totalAmount) * 100);
      if (data.amount !== expectedAmount || data.currency.toUpperCase() !== order.currency.toUpperCase()) {
        return NextResponse.json({ error: 'Payment amount or currency mismatch' }, { status: 400 });
      }

      if (order.status === 'PENDING') {
        await db.update(orders).set({ status: 'PAID' }).where(eq(orders.id, order.id));
      }

      if (order.items.some((item) => item.type === 'DIGITAL') && !order.digitalEmailSentAt) {
        const digitalItems = order.items.filter((item) => item.type === 'DIGITAL' && item.digitalFileKey);
        const downloads = await Promise.all(digitalItems.map(async (item) => ({
          name: item.name,
          url: await createR2DownloadUrl(item.digitalFileKey!, 60 * 60 * 24),
        })));
        if (!downloads.length) return NextResponse.json({ error: 'Digital order has no downloadable files' }, { status: 500 });

        await sendDigitalDeliveryEmail({ email: order.customerEmail, reference: order.paystackReference, downloads });
        await db.update(orders).set({ digitalEmailSentAt: new Date() }).where(eq(orders.id, order.id));
      }

      return NextResponse.json({ received: true, status: 'PAID' });
    }

    return NextResponse.json({ received: true, status: 'ignored' });
  } catch (error) {
    console.error('Paystack webhook error', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
