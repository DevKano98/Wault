require('./env');

const { Redis } = require('@upstash/redis');

const redisCache = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

function extractBullHost(restUrl) {
  if (!restUrl) {
    return undefined;
  }

  try {
    return new URL(restUrl).hostname;
  } catch (error) {
    return undefined;
  }
}

function isPlaceholder(value) {
  return !value || /YOUR_|your_|TO_BE_FILLED|replace_with/.test(value);
}

const bullConnection = {
  host:
    process.env.UPSTASH_REDIS_HOST ||
    extractBullHost(process.env.UPSTASH_REDIS_REST_URL),
  port: 6379,
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: {},
};

function isBullConfigured() {
  return Boolean(
    bullConnection.host &&
      bullConnection.password &&
      !isPlaceholder(bullConnection.host) &&
      !isPlaceholder(bullConnection.password),
  );
}

async function cacheSet(key, value, ttlSeconds) {
  await redisCache.set(key, JSON.stringify(value), { ex: ttlSeconds });
}

async function cacheGet(key) {
  const result = await redisCache.get(key);

  if (result == null) {
    return null;
  }

  return typeof result === 'string' ? JSON.parse(result) : result;
}

async function cacheDel(key) {
  await redisCache.del(key);
}

module.exports = {
  redisCache,
  bullConnection,
  isBullConfigured,
  cacheSet,
  cacheGet,
  cacheDel,
};
