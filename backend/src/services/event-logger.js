const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const EVENTS_FILE = path.join(__dirname, '../../data/events.json');
const MAX_EVENTS_PER_DEVICE = 1000; // Guardar último mes aprox.

class EventLoggerService {
  /**
   * Cargar eventos
   */
  async loadEvents() {
    try {
      const data = await fs.readFile(EVENTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.warn('Error loading events, returning empty', error.message);
      return {};
    }
  }

  /**
   * Guardar eventos
   */
  async saveEvents(events) {
    try {
      await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2));
      logger.debug('Events saved');
    } catch (error) {
      logger.error('Error saving events', error.message);
      throw error;
    }
  }

  /**
   * Crear nuevo evento
   */
  async logEvent(deviceId, eventData) {
    try {
      const events = await this.loadEvents();

      if (!events[deviceId]) {
        events[deviceId] = [];
      }

      const event = {
        id: uuidv4().substring(0, 8),
        timestamp: new Date().toISOString(),
        type: eventData.type || 'system',
        severity: eventData.severity || 'info',
        title: eventData.title || 'Event',
        message: eventData.message || '',
        userId: eventData.userId || 'system',
        data: eventData.data || {}
      };

      events[deviceId].push(event);

      // Mantener solo los últimos MAX_EVENTS_PER_DEVICE eventos
      if (events[deviceId].length > MAX_EVENTS_PER_DEVICE) {
        events[deviceId] = events[deviceId].slice(-MAX_EVENTS_PER_DEVICE);
      }

      await this.saveEvents(events);
      logger.info(`Event logged for ${deviceId}`, { type: event.type, severity: event.severity });

      return event;
    } catch (error) {
      logger.error('Error logging event', error.message);
      throw error;
    }
  }

  /**
   * Obtener todos los eventos de un dispositivo
   */
  async getEvents(deviceId, limit = 50, offset = 0) {
    try {
      const events = await this.loadEvents();
      const deviceEvents = events[deviceId] || [];

      return {
        total: deviceEvents.length,
        events: deviceEvents.slice(-limit - offset, -offset || undefined).reverse(),
        limit,
        offset
      };
    } catch (error) {
      logger.error('Error getting events', error.message);
      return { total: 0, events: [], limit, offset };
    }
  }

  /**
   * Filtrar eventos por tipo
   */
  async getEventsByType(deviceId, type, limit = 50) {
    try {
      const events = await this.loadEvents();
      const deviceEvents = events[deviceId] || [];

      const filtered = deviceEvents
        .filter(e => e.type === type)
        .slice(-limit)
        .reverse();

      return {
        type,
        count: filtered.length,
        events: filtered
      };
    } catch (error) {
      logger.error('Error filtering events', error.message);
      return { type, count: 0, events: [] };
    }
  }

  /**
   * Buscar eventos por texto
   */
  async searchEvents(deviceId, query, limit = 50) {
    try {
      const events = await this.loadEvents();
      const deviceEvents = events[deviceId] || [];
      const lowerQuery = query.toLowerCase();

      const filtered = deviceEvents
        .filter(e =>
          e.title.toLowerCase().includes(lowerQuery) ||
          e.message.toLowerCase().includes(lowerQuery) ||
          e.type.toLowerCase().includes(lowerQuery)
        )
        .slice(-limit)
        .reverse();

      return {
        query,
        count: filtered.length,
        events: filtered
      };
    } catch (error) {
      logger.error('Error searching events', error.message);
      return { query, count: 0, events: [] };
    }
  }

  /**
   * Filtrar por severidad
   */
  async getEventsBySeverity(deviceId, severity, limit = 50) {
    try {
      const events = await this.loadEvents();
      const deviceEvents = events[deviceId] || [];

      const filtered = deviceEvents
        .filter(e => e.severity === severity)
        .slice(-limit)
        .reverse();

      return {
        severity,
        count: filtered.length,
        events: filtered
      };
    } catch (error) {
      logger.error('Error getting events by severity', error.message);
      return { severity, count: 0, events: [] };
    }
  }

  /**
   * Obtener eventos de las últimas N horas
   */
  async getRecentEvents(deviceId, hoursBack = 24, limit = 100) {
    try {
      const events = await this.loadEvents();
      const deviceEvents = events[deviceId] || [];
      const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      const filtered = deviceEvents
        .filter(e => new Date(e.timestamp) >= cutoffTime)
        .slice(-limit)
        .reverse();

      return {
        timeRange: `${hoursBack}h`,
        count: filtered.length,
        events: filtered
      };
    } catch (error) {
      logger.error('Error getting recent events', error.message);
      return { timeRange: `${hoursBack}h`, count: 0, events: [] };
    }
  }

  /**
   * Obtener estadísticas de eventos
   */
  async getEventStats(deviceId) {
    try {
      const events = await this.loadEvents();
      const deviceEvents = events[deviceId] || [];

      const stats = {
        total: deviceEvents.length,
        byType: {},
        bySeverity: {},
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      deviceEvents.forEach(event => {
        // Por tipo
        stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;

        // Por severidad
        stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;

        // Por tiempo
        const eventTime = new Date(event.timestamp);
        if (eventTime >= today) stats.today++;
        if (eventTime >= weekAgo) stats.thisWeek++;
        if (eventTime >= monthAgo) stats.thisMonth++;
      });

      return stats;
    } catch (error) {
      logger.error('Error getting event stats', error.message);
      return { total: 0, byType: {}, bySeverity: {} };
    }
  }

  /**
   * Eliminar evento
   */
  async deleteEvent(deviceId, eventId) {
    try {
      const events = await this.loadEvents();
      const deviceEvents = events[deviceId] || [];

      const initialLength = deviceEvents.length;
      events[deviceId] = deviceEvents.filter(e => e.id !== eventId);

      if (events[deviceId].length < initialLength) {
        await this.saveEvents(events);
        logger.info(`Event deleted: ${eventId}`);
        return { success: true };
      }

      return { success: false, error: 'Event not found' };
    } catch (error) {
      logger.error('Error deleting event', error.message);
      throw error;
    }
  }

  /**
   * Limpiar eventos antiguos
   */
  async cleanOldEvents(daysToKeep = 30) {
    try {
      const events = await this.loadEvents();
      const cutoffTime = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      for (const deviceId in events) {
        events[deviceId] = events[deviceId].filter(event => {
          return new Date(event.timestamp) >= cutoffTime;
        });
      }

      await this.saveEvents(events);
      logger.info(`Old events cleaned (keeping last ${daysToKeep} days)`);
    } catch (error) {
      logger.error('Error cleaning old events', error.message);
    }
  }
}

module.exports = new EventLoggerService();
