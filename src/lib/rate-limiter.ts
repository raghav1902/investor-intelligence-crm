import { Redis } from '@upstash/redis';

interface RateRecord {
  count: number;
  resetAt: number;
}

// Map fallback: `${ip}-${routeKey}` -> { count, resetAt }
const store = new Map<string, RateRecord>();

// Periodically sweep expired entries to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetAt < now) store.delete(key);
  }
}, 60_000);

let redis: Redis | null = null;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    console.log('✅ Distributed Rate Limiter: Upstash Redis Client initialized.');
  } catch (error) {
    console.error('❌ Failed to initialize Upstash Redis Client. Falling back to in-memory.', error);
  }
} else {
  console.log('⚠️ UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing. Rate limiting running in IN-MEMORY mode.');
}

/**
 * Async rate limiter supporting Upstash Redis or In-Memory fallback.
 */
export async function rateLimit(
  ip: string,
  routeKey: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  
  if (redis) {
    try {
      const key = `ratelimit:${routeKey}:${ip}`;
      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.ttl(key);
      const results = await pipeline.exec();
      
      const current = results[0] as number;
      let ttl = results[1] as number;
      
      if (current === 1 || ttl === -1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
        ttl = Math.ceil(windowMs / 1000);
      }
      
      const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : windowMs);
      const allowed = current <= limit;
      const remaining = Math.max(0, limit - current);
      
      return { allowed, remaining, resetAt };
    } catch (error) {
      console.error('⚠️ Upstash Redis rate limit check failed. Falling back to in-memory logic:', error);
    }
  }

  // In-Memory Fallback Store Logic
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
 * Extract the real client IP or session/workspace identifier from Request headers.
 */
export function getClientIp(req: Request): string {
  const headers = (req as any).headers;
  if (!headers) return 'unknown';

  const getHeader = (name: string): string | null => {
    if (typeof headers.get === 'function') {
      return headers.get(name);
    }
    return headers[name] || headers[name.toLowerCase()] || null;
  };

  const xForwardedFor = getHeader('x-forwarded-for');
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();

  const xRealIp = getHeader('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  const cfConnectingIp = getHeader('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  const xVercelForwardedFor = getHeader('x-vercel-forwarded-for');
  if (xVercelForwardedFor) return xVercelForwardedFor.split(',')[0].trim();

  const workspaceId = getHeader('x-workspace-id');
  if (workspaceId) return `ws-${workspaceId}`;

  return 'unknown';
}
