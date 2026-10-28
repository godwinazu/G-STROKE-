export function requireAdminSession() {
  const isLocalDevelopment = process.env.NODE_ENV !== 'production';
  const adminSessionToken = process.env.ADMIN_SESSION_TOKEN || '';

  return isLocalDevelopment || Boolean(adminSessionToken);
}
