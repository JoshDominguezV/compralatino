import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis?: Redis };
export const redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null
});
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

const localWindows = new Map<string, { count: number; expiresAt: number }>();

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const count = await redis.incr(`ratelimit:${key}`);
    if (count === 1) await redis.expire(`ratelimit:${key}`, windowSeconds);
    return count <= limit;
  } catch {
    const now = Date.now();
    for (const [storedKey, value] of localWindows) if (value.expiresAt <= now) localWindows.delete(storedKey);
    const current = localWindows.get(key);
    if (!current || current.expiresAt <= now) {
      localWindows.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
      return true;
    }
    current.count += 1;
    return current.count <= limit;
  }
}

export function requestAddress(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return request.headers.get('x-real-ip') ?? forwarded ?? 'local';
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try { const value = await redis.get(key); return value ? JSON.parse(value) as T : null; } catch { return null; }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  try { await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds); } catch {}
}

export async function cacheDelete(key: string): Promise<void> {
  try { await redis.del(key); } catch {}
}
