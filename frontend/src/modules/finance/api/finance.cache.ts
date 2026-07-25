export function isFinanceCacheKey(key: unknown): boolean {
  return (
    Array.isArray(key) &&
    typeof key[0] === 'string' &&
    key[0].startsWith('/finance/')
  );
}
