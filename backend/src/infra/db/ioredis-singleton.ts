// ioredis-singleton.ts
import IORedis from 'ioredis';

let redisInstance: IORedis | null = null;

export function getRedisInstance(): IORedis {
  if (!redisInstance) {
    redisInstance = new IORedis({
      host: 'localhost', // Use 'redis' if running inside Docker network
      port: 6379,
      maxRetriesPerRequest: null, // Disable retrying failed requests
    });
  }
  return redisInstance;
}
