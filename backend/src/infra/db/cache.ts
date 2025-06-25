import IORedis from 'ioredis';
import { redisConfig } from '../../config/redis.config';

let redisInstance: IORedis | null = null;

export function getRedisInstance(): IORedis {
  if (!redisInstance) {
    redisInstance = new IORedis({
      host: redisConfig.host,
      port: redisConfig.port,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
    });
  }
  return redisInstance;
}
