// 📦 backend/redis.js

const Redis = require('ioredis');
const redis = new Redis(); // nutzt localhost:6379

module.exports = {
  get: async (key) => await redis.get(key),
  incrBy: async (key, value) => await redis.incrby(key, value),
  expire: async (key, seconds) => await redis.expire(key, seconds),
};
