const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

async function remember(key, ttlSeconds, producer) {
  const existing = cache.get(key);
  if (existing !== undefined) return existing;

  const value = await producer();
  cache.set(key, value, ttlSeconds);
  return value;
}

function invalidate(key) {
  cache.del(key);
}

function invalidatePrefix(prefix) {
  const keys = cache.keys().filter((k) => k.startsWith(prefix));
  cache.del(keys);
}

module.exports = { remember, invalidate, invalidatePrefix };
