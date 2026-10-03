const logger = require('../utils/logger');

class CacheService {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 300000; // 5 min
    this.cache = new Map();
    this.ttlTimers = new Map();
  }

  set(key, value, options = {}) {
    const ttl = options.ttl || this.defaultTTL;

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.delete(firstKey);
    }

    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
    }

    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      hits: 0
    });

    const timer = setTimeout(() => this.delete(key), ttl);
    this.ttlTimers.set(key, timer);

    return this;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (entry) {
      entry.hits++;
      return entry.value;
    }
    return null;
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
      this.ttlTimers.delete(key);
    }
    return this.cache.delete(key);
  }

  invalidate(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }

    return count;
  }

  clear() {
    for (const timer of this.ttlTimers.values()) {
      clearTimeout(timer);
    }
    this.cache.clear();
    this.ttlTimers.clear();
  }

  getStats() {
    const entries = Array.from(this.cache.entries());
    const totalHits = entries.reduce((sum, [_, e]) => sum + e.hits, 0);

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationRate: (this.cache.size / this.maxSize) * 100,
      totalHits,
      avgHits: entries.length > 0 ? totalHits / entries.length : 0,
      hitRate: totalHits / (totalHits + (this.maxSize - this.cache.size)) || 0
    };
  }
}

module.exports = new CacheService();
