const express = require('express');
const router = express.Router({ mergeParams: true });
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
 * GET /api/v1/devices/:deviceId/events
 * Obtener eventos del dispositivo
 */
router.get('/', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    if (limit < 1 || limit > 100) {
      logger.warn('Invalid limit parameter', { limit });
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
    }

    const result = await eventLogger.getEvents(deviceId, limit, offset);

    logger.info(`Events retrieved for ${deviceId}`, {
      total: result.total,
      returned: result.events.length
    });

    res.json({
      success: true,
      deviceId,
      ...result
    });
  } catch (error) {
    logger.error('Error getting events', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/devices/:deviceId/events/type/:type
 * Obtener eventos por tipo
 */
router.get('/type/:type', async (req, res) => {
  try {
    const { deviceId, type } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (limit < 1 || limit > 100) {
      logger.warn('Invalid limit parameter', { limit });
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
    }

    const result = await eventLogger.getEventsByType(deviceId, type, limit);

    logger.info(`Events filtered by type for ${deviceId}`, {
      type,
      count: result.count
    });

    res.json({
      success: true,
      deviceId,
      ...result
    });
  } catch (error) {
    logger.error('Error filtering events by type', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/devices/:deviceId/events/severity/:severity
 * Obtener eventos por severidad
 */
router.get('/severity/:severity', async (req, res) => {
  try {
    const { deviceId, severity } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (limit < 1 || limit > 100) {
      logger.warn('Invalid limit parameter', { limit });
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
    }

    const result = await eventLogger.getEventsBySeverity(deviceId, severity, limit);

    logger.info(`Events filtered by severity for ${deviceId}`, {
      severity,
      count: result.count
    });

    res.json({
      success: true,
      deviceId,
      ...result
    });
  } catch (error) {
    logger.error('Error filtering events by severity', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/devices/:deviceId/events/search
 * Buscar eventos
 */
router.get('/search', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      logger.warn('Invalid search query', { q });
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const limit = parseInt(req.query.limit) || 50;
    const result = await eventLogger.searchEvents(deviceId, q, limit);

    logger.info(`Events searched for ${deviceId}`, {
      query: q,
      count: result.count
    });

    res.json({
      success: true,
      deviceId,
      ...result
    });
  } catch (error) {
    logger.error('Error searching events', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/devices/:deviceId/events/recent
 * Obtener eventos recientes
 */
router.get('/recent', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const hoursBack = parseInt(req.query.hours) || 24;
    const limit = parseInt(req.query.limit) || 50;

    if (hoursBack < 1 || hoursBack > 168) {
      logger.warn('Invalid hours parameter', { hoursBack });
      return res.status(400).json({
        success: false,
        error: 'Hours must be between 1 and 168'
      });
    }

    const result = await eventLogger.getRecentEvents(deviceId, hoursBack, limit);

    logger.info(`Recent events retrieved for ${deviceId}`, {
      hoursBack,
      count: result.count
    });

    res.json({
      success: true,
      deviceId,
      ...result
    });
  } catch (error) {
    logger.error('Error getting recent events', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/devices/:deviceId/events/stats
 * Obtener estadísticas de eventos
 */
router.get('/stats', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const stats = await eventLogger.getEventStats(deviceId);

    logger.info(`Event stats retrieved for ${deviceId}`, stats);

    res.json({
      success: true,
      deviceId,
      stats
    });
  } catch (error) {
    logger.error('Error getting event stats', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/devices/:deviceId/events
 * Crear nuevo evento
 */
router.post('/', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { type, severity, title, message, data, userId } = req.body;

    if (!type || !severity || !title || !message) {
      logger.warn('Missing required event fields', { deviceId });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, severity, title, message'
      });
    }

    const event = await eventLogger.logEvent(deviceId, {
      type,
      severity,
      title,
      message,
      data,
      userId: userId || req.userId || 'system'
    });

    logger.info(`Event created for ${deviceId}`, {
      type,
      severity
    });

    res.status(201).json({
      success: true,
      deviceId,
      event
    });
  } catch (error) {
    logger.error('Error creating event', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/devices/:deviceId/events/:eventId
 * Eliminar evento
 */
router.delete('/:eventId', async (req, res) => {
  try {
    const { deviceId, eventId } = req.params;
    const result = await eventLogger.deleteEvent(deviceId, eventId);

    if (!result.success) {
      logger.warn('Event not found', { deviceId, eventId });
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    logger.info(`Event deleted for ${deviceId}`, { eventId });

    res.json({
      success: true,
      deviceId,
      eventId,
      message: 'Event deleted'
    });
  } catch (error) {
    logger.error('Error deleting event', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
