import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/schema';
import { createPaystackCheckoutUrl, PAYSTACK_SECRET_KEY } from '@/lib/paystack';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, amount, reference, orderType = 'PHYSICAL', metadata } = body;

    if (!email || !amount || !reference) {
      return NextResponse.json({ error: 'Missing required checkout fields' }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      await db.insert(orders).values({
        paystackReference: reference,
        customerEmail: email,
        totalAmount: String(amount),
        orderType,
      }).onConflictDoNothing();
    }

    if (PAYSTACK_SECRET_KEY) {
      const response = await fetch(createPaystackCheckoutUrl(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: Number(amount) * 100,
          reference,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success`,
          metadata: metadata || {},
        }),
      });

      const paystackData = await response.json();

      if (!paystackData.status) {
        return NextResponse.json({ error: paystackData.message || 'Paystack initialization failed' }, { status: 400 });
      }

      return NextResponse.json(paystackData);
    }

    const paystackResponse = {
      status: true,
      message: 'Checkout initialized in demo mode',
      data: {
        reference,
        authorization_url: `https://checkout.paystack.com/${reference}`,
        access_code: 'demo-access-code',
      },
      metadata,
    };

    return NextResponse.json(paystackResponse);
  } catch (error) {
    console.error('Checkout error', error);
    return NextResponse.json({ error: 'Failed to initialize checkout' }, { status: 500 });
  }
}
