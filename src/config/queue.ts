import { ConnectionOptions, DefaultJobOptions } from "bullmq";
import IORedis from "ioredis";
export const redisConnection: ConnectionOptions = new IORedis({
  host: '127.0.0.1', // or your Redis server IP
  port: 6379,        // default Redis port
  maxRetriesPerRequest:null
});

export const defaultQueueConfig: DefaultJobOptions = {
  removeOnComplete: {
    count: 20,
    age: 60 * 60,
  },
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
};