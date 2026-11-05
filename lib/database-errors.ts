export function isMissingDatabaseRelation(error: unknown, seen = new Set<object>()): boolean {
  if (!error || typeof error !== 'object') return false;
  if (seen.has(error)) return false;
  seen.add(error);

  const databaseError = error as { code?: unknown; cause?: unknown };
  if (databaseError.code === '42P01') return true;
  return isMissingDatabaseRelation(databaseError.cause, seen);
}
