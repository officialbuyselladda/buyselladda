import redis from '../config/redis.js';

const cache = (ttlSeconds = 60) => async (req, res, next) => {
  if (req.method !== 'GET' || req.headers.authorization || !redis.isReady) {
    return next();
  }

  const key = `cache:${req.originalUrl}`;

  try {
    const cached = await redis.client.get(key);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis.client.setEx(key, ttlSeconds, JSON.stringify(body)).catch(() => {});
      }
      res.set('X-Cache', 'MISS');
      return originalJson(body);
    };
  } catch (error) {
    console.error('Cache middleware error:', error.message);
  }

  return next();
};

export default cache;
