class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.startTime = performance.now();
  }

  mark(label) {
    performance.mark(label);
  }

  measure(label, startMark, endMark) {
    try {
      performance.measure(label, startMark, endMark);
      const measure = performance.getEntriesByName(label)[0];
      this.metrics.push({
        label,
        duration: measure.duration,
        timestamp: new Date()
      });
      return measure.duration;
    } catch (error) {
      console.error('Performance measure error:', error);
    }
  }

  recordMetric(name, value) {
    this.metrics.push({
      name,
      value,
      timestamp: new Date()
    });
  }

  getMetrics() {
    return this.metrics;
  }

  getAverageDuration(label) {
    const relevant = this.metrics.filter(m => m.label === label);
    if (relevant.length === 0) return 0;
    return relevant.reduce((sum, m) => sum + m.duration, 0) / relevant.length;
  }

  logMetrics() {
    console.table(this.metrics);
  }

  getReport() {
    return {
      totalMetrics: this.metrics.length,
      metrics: this.metrics,
      uptime: performance.now() - this.startTime
    };
  }

  reset() {
    this.metrics = [];
    performance.clearMarks();
    performance.clearMeasures();
  }
}

export default new PerformanceMonitor();
