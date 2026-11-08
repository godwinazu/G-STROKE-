import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'gstroke_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function configuredAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) return null;
  return { email, password };
}

function secureStringEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

export function areAdminCredentialsConfigured() {
  return configuredAdminCredentials() !== null;
}

export function verifyAdminCredentials(email: string, password: string) {
  const expected = configuredAdminCredentials();
  if (!expected) return false;

  const emailMatches = secureStringEqual(email.trim().toLowerCase(), expected.email);
  const passwordMatches = secureStringEqual(password, expected.password);
  return emailMatches && passwordMatches;
}

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters');
  return secret;
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = String(expiresAt);
  const signature = createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  return { value: `${payload}.${signature}`, maxAge: SESSION_DURATION_SECONDS };
}

function isValidAdminSession(value: string | undefined) {
  if (!value) return false;
  const [expiresAt, signature, ...rest] = value.split('.');
  if (rest.length || !/^\d+$/.test(expiresAt || '') || !signature) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  try {
    const expected = createHmac('sha256', sessionSecret()).update(expiresAt).digest();
    const provided = Buffer.from(signature, 'base64url');
    return provided.length === expected.length && timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}

export async function isAdminCookieHeader(cookieHeader: string | null) {
  const cookie = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`));

  if (!cookie) return false;

  try {
    return isValidAdminSession(decodeURIComponent(cookie.slice(ADMIN_COOKIE_NAME.length + 1)));
  } catch {
    return false;
  }
}

export async function requireAdminSession() {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}
