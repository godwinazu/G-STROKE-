import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { commissions } from '@/lib/schema';

const commissionSchema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  subjectType: z.string().min(2),
  medium: z.string().min(2),
  dimensions: z.string().min(2),
  budgetEstimate: z.number().int().nonnegative(),
  details: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = commissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid commission payload' }, { status: 400 });
    }

    await db.insert(commissions).values({
      customerName: parsed.data.customerName,
      email: parsed.data.email,
      subjectType: parsed.data.subjectType,
      medium: parsed.data.medium,
      dimensions: parsed.data.dimensions,
      budgetEstimate: parsed.data.budgetEstimate,
      details: parsed.data.details,
      status: 'PENDING',
    });

    return NextResponse.json({
      success: true,
      message: 'Commission inquiry submitted successfully.',
    });
  } catch (error) {
    console.error('Commission submission error', error);
    return NextResponse.json({ error: 'Failed to submit commission inquiry' }, { status: 500 });
  }
}
