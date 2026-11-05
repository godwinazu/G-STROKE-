import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { db } from '@/lib/db';
import { artworks, orders } from '@/lib/schema';
import { createPaystackCheckoutUrl, PAYSTACK_SECRET_KEY } from '@/lib/paystack';
import { and, eq, isNull, inArray } from 'drizzle-orm';

const checkoutSchema = z.object({
  email: z.string().email().max(255),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(10),
    paperFinish: z.enum(['matte', 'satin']).optional(),
    frame: z.enum(['none', 'black', 'oak']).optional(),
  })).min(1).max(20),
  shippingAddress: z.object({
    name: z.string().min(2).max(120),
    phone: z.string().min(5).max(40),
    address: z.string().min(5).max(240),
    city: z.string().min(2).max(100),
    country: z.string().min(2).max(100),
  }).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid checkout details' }, { status: 400 });
    }

    if (!process.env.DATABASE_URL || !PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Checkout is not configured' }, { status: 503 });
    }

    const productIds = parsed.data.items.map((item) => Number(item.productId));
    if (productIds.some((id) => !Number.isSafeInteger(id) || id < 1)) {
      return NextResponse.json({ error: 'Invalid product selection' }, { status: 400 });
    }

    const availableProducts = await db.select().from(artworks).where(and(
      inArray(artworks.id, productIds),
      eq(artworks.isVisible, true),
      isNull(artworks.archivedAt)
    ));
    const productById = new Map(availableProducts.map((product) => [String(product.id), product]));
    const items = parsed.data.items.map(({ productId, quantity, paperFinish, frame }) => {
      const product = productById.get(productId);
      if (!product) throw new Error('UNKNOWN_PRODUCT');
      if (product.isDigital && !product.r2DigitalFileKey) throw new Error('DIGITAL_FILE_UNAVAILABLE');
      const selectedFinish = product.isDigital ? undefined : paperFinish || 'matte';
      const selectedFrame = product.isDigital ? undefined : frame || 'none';
      const finishSurcharge = selectedFinish === 'satin' ? 15 : 0;
      const frameSurcharge = selectedFrame === 'black' ? 75 : selectedFrame === 'oak' ? 95 : 0;
      return {
        productId,
        name: product.title,
        quantity,
        unitPrice: Number(product.price) + finishSurcharge + frameSurcharge,
        type: product.isDigital ? 'DIGITAL' as const : 'PHYSICAL' as const,
        ...(product.isDigital && product.r2DigitalFileKey ? { digitalFileKey: product.r2DigitalFileKey } : {}),
        ...(selectedFinish ? { paperFinish: selectedFinish } : {}),
        ...(selectedFrame ? { frame: selectedFrame } : {}),
      };
    });
    const amount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const orderType = items.every((item) => item.type === 'DIGITAL') ? 'DIGITAL' : 'PHYSICAL';
    const reference = `GST-${randomUUID()}`;
    const currency = process.env.PAYSTACK_CURRENCY || 'USD';

    if (orderType === 'PHYSICAL' && !parsed.data.shippingAddress) {
      return NextResponse.json({ error: 'Shipping details are required for physical products' }, { status: 400 });
    }
    if (items.some((item) => item.type === 'DIGITAL') && (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)) {
      return NextResponse.json({ error: 'Digital delivery email is not configured' }, { status: 503 });
    }

    await db.insert(orders).values({
      paystackReference: reference,
      customerEmail: parsed.data.email,
      totalAmount: String(amount),
      orderType,
      currency,
      items,
      shippingAddress: parsed.data.shippingAddress,
      shippingStatus: orderType === 'PHYSICAL' ? 'UNFULFILLED' : 'NOT_REQUIRED',
    });

    const response = await fetch(createPaystackCheckoutUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: parsed.data.email,
        amount: Math.round(amount * 100),
        currency,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin}/checkout/success`,
        metadata: { items: items.map(({ productId, quantity }) => ({ productId, quantity })) },
      }),
    });

    const paystackData = await response.json();
    if (!response.ok || !paystackData.status || !paystackData.data?.authorization_url) {
      return NextResponse.json({ error: paystackData.message || 'Paystack initialization failed' }, { status: 502 });
    }

    return NextResponse.json({ reference, authorizationUrl: paystackData.data.authorization_url });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNKNOWN_PRODUCT') {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'DIGITAL_FILE_UNAVAILABLE') {
      return NextResponse.json({ error: 'A digital product is missing its download file' }, { status: 409 });
    }
    console.error('Checkout error', error);
    return NextResponse.json({ error: 'Failed to initialize checkout' }, { status: 500 });
  }
}
