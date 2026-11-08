import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { commissions, orders } from '@/lib/schema';
import { isAdminCookieHeader } from '@/lib/admin';

const recordSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('shipping'), id: z.number().int().positive(), status: z.enum(['PROCESSING', 'SHIPPED', 'DELIVERED']) }),
  z.object({ type: z.literal('commission'), id: z.number().int().positive(), status: z.enum(['APPROVED', 'IN_PROGRESS', 'COMPLETED']) }),
]);

export async function PATCH(request: Request) {
  if (!(await isAdminCookieHeader(request.headers.get('cookie')))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = recordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid record update' }, { status: 400 });

  if (parsed.data.type === 'shipping') {
    await db.update(orders).set({
      shippingStatus: parsed.data.status,
      ...(parsed.data.status === 'DELIVERED' ? { status: 'FULFILLED' as const } : {}),
    }).where(eq(orders.id, parsed.data.id));
  } else {
    await db.update(commissions).set({ status: parsed.data.status }).where(eq(commissions.id, parsed.data.id));
  }

  return NextResponse.json({ success: true });
}