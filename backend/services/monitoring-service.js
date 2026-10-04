class MonitoringService {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      avgResponseTime: 0,
      activeConnections: 0,
      syncOperations: 0,
      failedSyncs: 0,
      dbQueryTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.requestTimes = [];
  }

  recordRequest(duration) {
    this.metrics.requests++;
    this.requestTimes.push(duration);
    if (this.requestTimes.length > 1000) {
      this.requestTimes.shift();
    }
    this.metrics.avgResponseTime = Math.round(
      this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length
    );
  }

  recordError() {
    this.metrics.errors++;
  }

  recordSync(success = true) {
    this.metrics.syncOperations++;
    if (!success) {
      this.metrics.failedSyncs++;
    }
  }

  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  recordDbQuery(duration) {
    this.metrics.dbQueryTime = duration;
  }

  setActiveConnections(count) {
    this.metrics.activeConnections = count;
  }

  getMetrics() {
    const cacheTotal = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate = cacheTotal > 0 ? Math.round((this.metrics.cacheHits / cacheTotal) * 100) : 0;

    return {
      ...this.metrics,
      cacheHitRate: `${cacheHitRate}%`,
      errorRate: this.metrics.requests > 0 ? `${Math.round((this.metrics.errors / this.metrics.requests) * 100)}%` : '0%',
      syncSuccessRate: this.metrics.syncOperations > 0 ? `${Math.round(((this.metrics.syncOperations - this.metrics.failedSyncs) / this.metrics.syncOperations) * 100)}%` : '0%',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }

  getHealthStatus() {
    const metrics = this.getMetrics();
    const errorRate = parseInt(metrics.errorRate) || 0;
    const cacheHitRate = parseInt(metrics.cacheHitRate) || 0;

    if (errorRate > 10) return 'unhealthy';
    if (errorRate > 5 || cacheHitRate < 50) return 'degraded';
    return 'healthy';
  }

  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      avgResponseTime: 0,
      activeConnections: 0,
      syncOperations: 0,
      failedSyncs: 0,
      dbQueryTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.requestTimes = [];
  }
}

export default new MonitoringService();
