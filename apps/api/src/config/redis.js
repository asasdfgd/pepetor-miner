const Redis = require('ioredis');

let redis;
let cache;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  cache = {
    async get(key) {
      try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Cache get error:', error);
        return null;
      }
    },

    async set(key, value, expirySeconds = 60) {
      try {
        await redis.setex(key, expirySeconds, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Cache set error:', error);
        return false;
      }
    },

    async del(key) {
      try {
        await redis.del(key);
        return true;
      } catch (error) {
        console.error('Cache delete error:', error);
        return false;
      }
    },

    async flush() {
      try {
        await redis.flushdb();
        return true;
      } catch (error) {
        console.error('Cache flush error:', error);
        return false;
      }
    },
  };
} else {
  console.warn('⚠️  Redis URL not found, Redis is disabled.');
  // Mock cache object when Redis is not available
  cache = {
    async get() { return null; },
    async set() { return true; },
    async del() { return true; },
    async flush() { return true; },
  };
}

module.exports = { redis, cache };