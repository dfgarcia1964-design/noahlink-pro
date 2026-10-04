import express from 'express';
import monitoringService from '../services/monitoring-service.js';
import loggingService from '../services/logging-service.js';

const router = express.Router();

router.get('/health', (req, res) => {
  const status = monitoringService.getHealthStatus();
  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 206 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

router.get('/metrics', (req, res) => {
  const metrics = monitoringService.getMetrics();
  res.json({
    timestamp: new Date(),
    metrics,
    health: monitoringService.getHealthStatus()
  });
});

router.get('/requests', (req, res) => {
  const metrics = monitoringService.getMetrics();
  res.json({
    totalRequests: metrics.requests,
    avgResponseTime: `${metrics.avgResponseTime}ms`,
    errorRate: metrics.errorRate,
    activeConnections: metrics.activeConnections
  });
});

router.get('/sync', (req, res) => {
  const metrics = monitoringService.getMetrics();
  res.json({
    totalSyncOperations: metrics.syncOperations,
    failedSyncs: metrics.failedSyncs,
    successRate: metrics.syncSuccessRate
  });
});

router.get('/cache', (req, res) => {
  const metrics = monitoringService.getMetrics();
  res.json({
    cacheHits: metrics.cacheHits,
    cacheMisses: metrics.cacheMisses,
    hitRate: metrics.cacheHitRate
  });
});

router.post('/reset', (req, res) => {
  monitoringService.reset();
  loggingService.info('Metrics reset');
  res.json({ message: 'Metrics reset successfully' });
});

export default router;
