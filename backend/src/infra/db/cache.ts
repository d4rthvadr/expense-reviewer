import IORedis from 'ioredis';
import { redisConfig } from '../../config/redis.config';
import { log } from '@infra/logger';

let redisInstance: IORedis | null = null;

export function getRedisInstance(): IORedis {
  if (!redisInstance) {
    redisInstance = new IORedis(redisConfig.host, {
      family: 4, // Force IPv4
      connectTimeout: 10000, // 10 seconds timeout
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    // Add connection event listeners for debugging
    redisInstance.on('connect', () => {
      log.info('Redis connected successfully');
    });

    redisInstance.on('error', (err) => {
      log.error({
        message: 'Redis connection error',
        error: err,
        code: 'REDIS_CONNECTION_ERROR',
      });
    });
  }
  return redisInstance;
}
