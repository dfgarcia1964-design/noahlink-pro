const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * GET /api/v1/websocket/stats
 * Obtener estadísticas de WebSocket
 */
router.get('/stats', (req, res) => {
  try {
    if (!global.wsManager) {
      return res.status(503).json({
        success: false,
        error: 'WebSocket manager not initialized'
      });
    }

    const stats = global.wsManager.getStats();

    logger.info('WebSocket stats retrieved', stats);

    res.json({
      success: true,
      websocket: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting WebSocket stats', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/websocket/devices/:deviceId/users
 * Obtener usuarios conectados a un dispositivo
 */
router.get('/devices/:deviceId/users', (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!global.wsManager) {
      return res.status(503).json({
        success: false,
        error: 'WebSocket manager not initialized'
      });
    }

    const userCount = global.wsManager.getDeviceUsers(deviceId);

    logger.info(`Device users retrieved`, { deviceId, userCount });

    res.json({
      success: true,
      deviceId,
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting device users', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/websocket/devices/:deviceId/emit-battery
 * Emitir actualización de batería manualmente
 */
router.post('/devices/:deviceId/emit-battery', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { level, voltage, temperature } = req.body;

    if (!global.wsManager) {
      return res.status(503).json({
        success: false,
        error: 'WebSocket manager not initialized'
      });
    }

    // Validar datos opcionales
    let batteryData = null;
    if (level !== undefined) {
      if (typeof level !== 'number' || level < 0 || level > 100) {
        return res.status(400).json({
          success: false,
          error: 'Battery level must be between 0 and 100'
        });
      }

      batteryData = {
        level,
        voltage: voltage || null,
        temperature: temperature || null,
        status: level > 80 ? 'excellent' : level > 50 ? 'good' : 'low',
        statusLabel: level > 80 ? 'Excelente' : level > 50 ? 'Bueno' : 'Bajo'
      };
    }

    global.wsManager.emitBatteryUpdate(deviceId, batteryData);

    logger.info(`Battery update emitted manually`, {
      deviceId,
      level: batteryData?.level
    });

    res.json({
      success: true,
      deviceId,
      message: 'Battery update emitted',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error emitting battery update', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/websocket/devices/:deviceId/start-battery-emission
 * Iniciar emisión automática de batería
 */
router.post('/devices/:deviceId/start-battery-emission', (req, res) => {
  try {
    const { deviceId } = req.params;
    const interval = parseInt(req.body.interval) || 30000;

    if (!global.wsManager) {
      return res.status(503).json({
        success: false,
        error: 'WebSocket manager not initialized'
      });
    }

    if (interval < 5000 || interval > 300000) {
      return res.status(400).json({
        success: false,
        error: 'Interval must be between 5000 and 300000 ms'
      });
    }

    global.wsManager.startBatteryEmission(deviceId, interval);

    logger.info(`Battery emission started`, { deviceId, interval });

    res.json({
      success: true,
      deviceId,
      message: 'Battery emission started',
      interval,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error starting battery emission', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/websocket/devices/:deviceId/stop-battery-emission
 * Detener emisión automática de batería
 */
router.post('/devices/:deviceId/stop-battery-emission', (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!global.wsManager) {
      return res.status(503).json({
        success: false,
        error: 'WebSocket manager not initialized'
      });
    }

    global.wsManager.stopBatteryEmission(deviceId);

    logger.info(`Battery emission stopped`, { deviceId });

    res.json({
      success: true,
      deviceId,
      message: 'Battery emission stopped',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error stopping battery emission', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/websocket/notify-user
 * Enviar notificación a un usuario
 */
router.post('/notify-user', (req, res) => {
  try {
    const { userId, message, type, data } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId and message required'
      });
    }

    if (!global.wsManager) {
      return res.status(503).json({
        success: false,
        error: 'WebSocket manager not initialized'
      });
    }

    global.wsManager.notifyUser(userId, {
      message,
      type: type || 'info',
      data
    });

    logger.info(`Notification sent`, { userId, message });

    res.json({
      success: true,
      message: 'Notification sent',
      userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error sending notification', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
