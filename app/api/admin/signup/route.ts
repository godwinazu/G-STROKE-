import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { ADMIN_COOKIE_NAME, createAdminSession, hashAdminPassword } from '@/lib/admin';

const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(12).max(1024),
  signupKey: z.string().min(32).max(512),
});

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Check the email, password, and setup key.' }, { status: 400 });

  const expectedKey = process.env.ADMIN_SIGNUP_KEY;
  if (!expectedKey || expectedKey.length < 32) {
    return NextResponse.json({ error: 'Admin signup is not configured.' }, { status: 503 });
  }

  const supplied = Buffer.from(parsed.data.signupKey);
  const expected = Buffer.from(expectedKey);
  if (supplied.length !== expected.length || !require('crypto').timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: 'Invalid signup details.' }, { status: 401 });
  }

  try {
    const [existingAdmin] = await db.select({ id: users.id }).from(users)
      .where(eq(users.role, 'admin')).limit(1);
    if (existingAdmin) return NextResponse.json({ error: 'Admin signup is closed.' }, { status: 403 });

    const [user] = await db.insert(users).values({
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashAdminPassword(parsed.data.password),
      role: 'admin',
    }).returning({ id: users.id });

    const session = createAdminSession(user.id);
    const response = NextResponse.json({ authenticated: true }, { status: 201 });
    response.cookies.set(ADMIN_COOKIE_NAME, session.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: session.maxAge,
    });
    return response;
  } catch (error) {
    console.error('Admin signup error', error);
    return NextResponse.json({ error: 'Unable to create the admin account. Confirm the schema is applied and the email is unused.' }, { status: 409 });
  }
}