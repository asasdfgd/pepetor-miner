const { cache } = require('../config/redis');

const cacheMiddleware = (keyPrefix, ttl = 60) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const page = req.query.page || '1';
    const limit = req.query.limit || '20';
    const cacheKey = `${keyPrefix}:page:${page}:limit:${limit}`;

    try {
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        console.log(`💨 Cache hit: ${cacheKey}`);
        return res.json(cachedData);
      }

      res.locals.cacheKey = cacheKey;
      res.locals.cacheTTL = ttl;
      
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        cache.set(cacheKey, data, ttl);
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

module.exports = cacheMiddleware;
