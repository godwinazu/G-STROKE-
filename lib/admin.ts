import { timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'gstroke_admin_session';

export function isValidAdminToken(token: string | undefined) {
  const expected = process.env.ADMIN_SESSION_TOKEN;
  if (!token || !expected || expected.length < 32) return false;

  const providedBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export function isAdminCookieHeader(cookieHeader: string | null) {
  const cookie = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`));

  if (!cookie) return false;

  try {
    return isValidAdminToken(decodeURIComponent(cookie.slice(ADMIN_COOKIE_NAME.length + 1)));
  } catch {
    return false;
  }
}

export async function requireAdminSession() {
  const cookieStore = await cookies();
  return isValidAdminToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}
