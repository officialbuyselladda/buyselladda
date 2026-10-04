import { createClient } from 'redis';
import env from './env.js';

let client;
let isReady = false;

const getRedisClient = () => {
  if (client) return client;

  client = createClient({ url: env.REDIS_URL });

  client.on('ready', () => {
    isReady = true;
    console.log('Redis connected');
  });

  client.on('end', () => {
    isReady = false;
  });

  client.on('error', (error) => {
    isReady = false;
    console.error('Redis error:', error.message);
  });

  client.connect().catch((error) => {
    console.error('Redis connection failed:', error.message);
  });

  return client;
};

const redis = {
  get client() {
    return getRedisClient();
  },
  get isReady() {
    return isReady;
  },
};

export default redis;
