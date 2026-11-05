import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '@/lib/schema';
import { createR2DownloadUrl } from '@/lib/r2';
import { verifyPaystackTransaction } from '@/lib/paystack';

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const { reference } = await params;
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.paystackReference, reference))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Paid order not found' }, { status: 404 });
    }

    if (order.status !== 'PAID' && order.status !== 'FULFILLED') {
      const verified = await verifyPaystackTransaction(order.paystackReference);
      if (!verified || verified.reference !== order.paystackReference || verified.amount !== Math.round(Number(order.totalAmount) * 100) || verified.currency?.toUpperCase() !== order.currency.toUpperCase()) {
        return NextResponse.json({ error: 'Payment is still processing. Refresh this page shortly.' }, { status: 409 });
      }
      await db.update(orders).set({ status: 'PAID' }).where(eq(orders.id, order.id));
    }

    const downloadableItems = order.items.filter((item) => item.type === 'DIGITAL' && item.digitalFileKey);
    if (!downloadableItems.length) {
      return NextResponse.json({ error: 'No digital files are attached to this order' }, { status: 404 });
    }

    const downloads = await Promise.all(
      downloadableItems.map(async (item) => ({
        name: item.name,
        url: await createR2DownloadUrl(item.digitalFileKey!, 60 * 60 * 24),
      }))
    );

    await db.update(orders).set({ downloadCount: order.downloadCount + 1 }).where(eq(orders.id, order.id));
    return NextResponse.json({ downloads, expiresInSeconds: 60 * 60 * 24 });
  } catch (error) {
    console.error('Download link error', error);
    return NextResponse.json({ error: 'Unable to create download links' }, { status: 500 });
  }
}