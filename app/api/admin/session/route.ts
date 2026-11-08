import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ADMIN_COOKIE_NAME, areAdminCredentialsConfigured, createAdminSession, getAdminConfigurationIssues, verifyAdminCredentials } from '@/lib/admin';

export async function POST(request: Request) {
  const parsed = z.object({ email: z.string().email().max(255), password: z.string().min(1).max(1024) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email and password' }, { status: 400 });

  if (!areAdminCredentialsConfigured()) {
    return NextResponse.json({ error: getAdminConfigurationIssues().join(' ') }, { status: 503 });
  }

  if (!verifyAdminCredentials(parsed.data.email, parsed.data.password)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const session = createAdminSession();

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE_NAME, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: session.maxAge,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}