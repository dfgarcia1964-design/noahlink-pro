const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analytics-service');
const logger = require('../utils/logger');

router.get('/devices/:deviceId/analytics/usage', (req, res) => {
  try {
    const { deviceId } = req.params;
    const days = parseInt(req.query.days) || 7;

    const stats = analyticsService.calculateUsageStats(deviceId, days);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting usage stats', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate usage stats'
    });
  }
});

router.get('/devices/:deviceId/analytics/prediction', (req, res) => {
  try {
    const { deviceId } = req.params;

    const prediction = analyticsService.calculateBatteryPrediction(deviceId);

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    logger.error('Error getting battery prediction', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate battery prediction'
    });
  }
});

router.get('/devices/:deviceId/analytics/daily-stats', (req, res) => {
  try {
    const { deviceId } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const analytics = analyticsService.getSessionAnalytics(deviceId, date);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error getting daily stats', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get daily stats'
    });
  }
});

router.get('/devices/:deviceId/analytics/compare', (req, res) => {
  try {
    const deviceIds = req.query.devices ? req.query.devices.split(',') : [];

    if (deviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one device ID'
      });
    }

    const comparison = analyticsService.generateComparison(deviceIds);

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    logger.error('Error comparing devices', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare devices'
    });
  }
});

router.get('/devices/:deviceId/analytics/anomalies', (req, res) => {
  try {
    const { deviceId } = req.params;
    const timeRange = parseInt(req.query.days) || 7;

    const anomalies = analyticsService.detectAnomalies(deviceId, timeRange);

    res.json({
      success: true,
      data: anomalies
    });
  } catch (error) {
    logger.error('Error detecting anomalies', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect anomalies'
    });
  }
});

router.post('/devices/:deviceId/analytics/export', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { format } = req.body;

    const report = analyticsService.exportAnalyticsReport(deviceId, format || 'json');

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${deviceId}.csv`);
      res.send(report);
    } else {
      res.json({
        success: true,
        data: report
      });
    }
  } catch (error) {
    logger.error('Error exporting analytics', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics'
    });
  }
});

module.exports = router;
