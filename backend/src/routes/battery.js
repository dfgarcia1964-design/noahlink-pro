const express = require('express');
const router = express.Router({ mergeParams: true });
const batteryHistory = require('../services/battery-history');
const eventLogger = require('../services/event-logger');
const logger = require('../utils/logger');

// Middleware para validar deviceId
const validateDeviceId = (req, res, next) => {
  const { deviceId } = req.params;
  if (!deviceId || typeof deviceId !== 'string' || deviceId.length < 3) {
    logger.warn('Invalid device ID', { deviceId });
    return res.status(400).json({
      success: false,
      error: 'Invalid device ID'
    });
  }
  next();
};

router.use(validateDeviceId);

/**
 * GET /api/v1/devices/:deviceId/battery/history
 * Obtener historial de batería
 */
router.get('/history', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const hoursBack = parseInt(req.query.hours) || 24;
    const days = parseInt(req.query.days);

    let hours = hoursBack;
    if (days) {
      hours = days * 24;
    }

    // Validar rango
    if (hours < 1 || hours > 168) {
      logger.warn('Invalid hours parameter', { hours });
      return res.status(400).json({
        success: false,
        error: 'Hours must be between 1 and 168'
      });
    }

    const history = await batteryHistory.getHistory(deviceId, hours);

    logger.info(`Battery history retrieved for ${deviceId}`, {
      hours,
      recordCount: history.length
    });

    res.json({
      success: true,
      deviceId,
      timeRange: `${hours}h`,
      recordCount: history.length,
      data: history
    });
  } catch (error) {
    logger.error('Error getting battery history', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/devices/:deviceId/battery/stats
 * Obtener estadísticas de batería
 */
router.get('/stats', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const hoursBack = parseInt(req.query.hours) || 24;

    const stats = await batteryHistory.getStats(deviceId, hoursBack);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'No data available'
      });
    }

    logger.info(`Battery stats retrieved for ${deviceId}`, stats);

    res.json({
      success: true,
      deviceId,
      timeRange: `${hoursBack}h`,
      stats
    });
  } catch (error) {
    logger.error('Error getting battery stats', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/devices/:deviceId/battery/prediction
 * Predecir tiempo de duración de batería
 */
router.get('/prediction', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const prediction = await batteryHistory.predictDrainTime(deviceId);

    if (!prediction) {
      logger.warn('Cannot predict drain time (insufficient data)', { deviceId });
      return res.json({
        success: true,
        deviceId,
        prediction: null,
        message: 'Insufficient data for prediction'
      });
    }

    logger.info(`Battery prediction calculated for ${deviceId}`, prediction);

    res.json({
      success: true,
      deviceId,
      prediction
    });
  } catch (error) {
    logger.error('Error predicting battery', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/devices/:deviceId/battery/record
 * Grabar nuevo nivel de batería
 */
router.post('/record', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { level, voltage, temperature } = req.body;

    if (typeof level !== 'number' || level < 0 || level > 100) {
      logger.warn('Invalid battery level', { level });
      return res.status(400).json({
        success: false,
        error: 'Battery level must be between 0 and 100'
      });
    }

    const record = await batteryHistory.recordBattery(deviceId, {
      level,
      voltage,
      temperature
    });

    // Registrar evento si el nivel es bajo
    if (level < 20) {
      await eventLogger.logEvent(deviceId, {
        type: 'battery',
        severity: 'critical',
        title: 'Batería crítica',
        message: `Batería por debajo del 20% (${level}%)`,
        data: { level }
      });
    } else if (level < 50) {
      await eventLogger.logEvent(deviceId, {
        type: 'battery',
        severity: 'warning',
        title: 'Batería baja',
        message: `Batería por debajo del 50% (${level}%)`,
        data: { level }
      });
    }

    logger.info(`Battery recorded for ${deviceId}`, { level });

    res.status(201).json({
      success: true,
      deviceId,
      record
    });
  } catch (error) {
    logger.error('Error recording battery', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/devices/:deviceId/battery/latest
 * Obtener últimos registros
 */
router.get('/latest', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const count = parseInt(req.query.count) || 10;

    if (count < 1 || count > 100) {
      logger.warn('Invalid count parameter', { count });
      return res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 100'
      });
    }

    const records = await batteryHistory.getLatestRecords(deviceId, count);

    logger.info(`Latest battery records retrieved for ${deviceId}`, {
      count: records.length
    });

    res.json({
      success: true,
      deviceId,
      count: records.length,
      data: records
    });
  } catch (error) {
    logger.error('Error getting latest records', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
