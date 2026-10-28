export function requireAdminSession() {
  const isLocalDevelopment = process.env.NODE_ENV !== 'production';
  const adminSessionToken = process.env.ADMIN_SESSION_TOKEN || '';

  if (isLocalDevelopment) {
    return true;
  }

  return Boolean(adminSessionToken && adminSessionToken !== 'change-me-in-production');
}
