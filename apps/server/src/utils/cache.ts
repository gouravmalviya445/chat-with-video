import redis from "@/config/redis";

const CACHE_TTL_SECONDS = 30;

/** Read through Redis while keeping cache outages from taking down API reads. */
export async function getOrSetCache<T>(
  key: string,
  load: () => Promise<T>,
  ttlSeconds = CACHE_TTL_SECONDS,
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached !== null) return JSON.parse(cached) as T;
  } catch (error) {
    console.warn(`Redis cache read failed for ${key}`, error);
  }

  const value = await load();
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    console.warn(`Redis cache write failed for ${key}`, error);
  }
  return value;
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`Redis cache invalidation failed for ${key}`, error);
  }
}

export const cacheKeys = {
  conversationMessages: (userId: string, conversationId: string) =>
    `cache:user:${userId}:conversation:${conversationId}:messages`,
};
