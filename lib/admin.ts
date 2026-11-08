import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { promisify } from 'util';

export const ADMIN_COOKIE_NAME = 'gstroke_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 12;
const scrypt = promisify(scryptCallback) as (password: string, salt: string, keyLength: number) => Promise<Buffer>;

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters');
  return secret;
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyAdminPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [salt, hashHex] = storedHash.split(':');
  if (!salt || !hashHex || !/^[a-f0-9]{128}$/i.test(hashHex)) return false;

  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(hashHex, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createAdminSession(userId: number) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = `${userId}.${expiresAt}`;
  const signature = createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  return { value: `${payload}.${signature}`, maxAge: SESSION_DURATION_SECONDS };
}

function isValidAdminSession(value: string | undefined) {
  if (!value) return false;
  const [userId, expiresAt, signature, ...rest] = value.split('.');
  if (rest.length || !/^\d+$/.test(userId || '') || !/^\d+$/.test(expiresAt || '') || !signature) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  try {
    const payload = `${userId}.${expiresAt}`;
    const expected = createHmac('sha256', sessionSecret()).update(payload).digest();
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
