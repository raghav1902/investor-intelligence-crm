/**
 * Simple in-memory rate limiter for Next.js API routes.
 *
 * Why in-memory and not Redis?
 * - Redis requires a paid add-on. This is a free, zero-dependency solution.
 * - Works well for the primary threat: single-user script-based abuse.
 * - Resets on server restart (acceptable for this use case).
 *
 * Limits:
 *  - Heavy routes (PDF/Excel upload, OCR, dedup): 5 requests / 60 seconds per IP
 *  - Standard routes (GET contacts, PUT review): 60 requests / 60 seconds per IP
 */

interface RateRecord {
  count: number;
  resetAt: number;
}

// Map: `${ip}-${routeKey}` -> { count, resetAt }
const store = new Map<string, RateRecord>();

// Periodically sweep expired entries to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetAt < now) store.delete(key);
  }
}, 60_000);

export function rateLimit(
  ip: string,
  routeKey: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${ip}-${routeKey}`;
  const now = Date.now();
  let record = store.get(key);

  if (!record || record.resetAt < now) {
    record = { count: 0, resetAt: now + windowMs };
    store.set(key, record);
  }

  record.count++;
  const remaining = Math.max(0, limit - record.count);
  const allowed = record.count <= limit;

  return { allowed, remaining, resetAt: record.resetAt };
}

/**
 * Extract the real client IP from Next.js request headers.
 * Vercel sets x-forwarded-for; falls back to a safe default.
 */
export function getClientIp(req: Request): string {
  const forwarded = (req as any).headers?.get?.('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}
