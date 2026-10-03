class CacheManager {
  constructor() {
    this.memory = new Map();
    this.ttls = new Map();
  }

  set(key, value, ttl = 300000) {
    if (this.ttls.has(key)) clearTimeout(this.ttls.get(key));
    this.memory.set(key, value);
    const timer = setTimeout(() => this.delete(key), ttl);
    this.ttls.set(key, timer);
  }

  get(key) {
    return this.memory.get(key) || null;
  }

  delete(key) {
    if (this.ttls.has(key)) clearTimeout(this.ttls.get(key));
    this.memory.delete(key);
  }

  clear() {
    for (const timer of this.ttls.values()) clearTimeout(timer);
    this.memory.clear();
    this.ttls.clear();
  }

  getStats() {
    return { size: this.memory.size };
  }
}

export default new CacheManager();
