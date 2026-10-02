/**
 * Event Manager Service
 * Centralized logging for all device interactions
 */

const fs = require('fs');
const path = require('path');

const EVENT_TYPES = {
  DEVICE_CONNECTED: 'device_connected',
  DEVICE_DISCONNECTED: 'device_disconnected',
  VOLUME_CHANGED: 'volume_changed',
  PROGRAM_SWITCHED: 'program_switched',
  BATTERY_LOW: 'battery_low',
  BATTERY_CRITICAL: 'battery_critical',
  MUTE_TOGGLED: 'mute_toggled',
  ERROR: 'error',
  SETTINGS_CHANGED: 'settings_changed',
  FIRMWARE_UPDATE: 'firmware_update',
  SYNC_STARTED: 'sync_started',
  SYNC_COMPLETED: 'sync_completed'
};

const SEVERITY_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

class EventManager {
  constructor() {
    this.DATA_DIR = path.join(__dirname, '../../data');
    this.EVENTS_FILE = path.join(this.DATA_DIR, 'events.json');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.DATA_DIR)) {
      fs.mkdirSync(this.DATA_DIR, { recursive: true });
    }
  }

  /**
   * Log an event
   */
  logEvent(deviceId, type, data = {}, severity = SEVERITY_LEVELS.INFO) {
    if (!Object.values(EVENT_TYPES).includes(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    const event = {
      id: this.generateEventId(),
      deviceId,
      type,
      severity,
      timestamp: new Date().toISOString(),
      data: data
    };

    try {
      let events = this.getEventsByDeviceId(deviceId, 1000);
      events.push(event);

      // Keep last 500 events per device
      if (events.length > 500) {
        events = events.slice(-500);
      }

      this.saveEvents(deviceId, events);
      return event;
    } catch (error) {
      console.error('Error logging event:', error);
      throw error;
    }
  }

  /**
   * Get events for a device
   */
  getEventsByDeviceId(deviceId, limit = 50) {
    try {
      const allEvents = this.getAllEvents();
      const deviceEvents = allEvents.filter(e => e.deviceId === deviceId);
      return deviceEvents.slice(-limit);
    } catch (error) {
      console.error('Error getting events by device:', error);
      return [];
    }
  }

  /**
   * Get events filtered by type
   */
  getEventsByType(deviceId, type, limit = 50) {
    const events = this.getEventsByDeviceId(deviceId, 500);
    return events.filter(e => e.type === type).slice(-limit);
  }

  /**
   * Get events in date range
   */
  getEventsByDateRange(deviceId, startDate, endDate, limit = 100) {
    const events = this.getEventsByDeviceId(deviceId, 500);
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return events
      .filter(e => {
        const eventTime = new Date(e.timestamp).getTime();
        return eventTime >= start && eventTime <= end;
      })
      .slice(-limit);
  }

  /**
   * Get events by severity
   */
  getEventsBySeverity(deviceId, severity, limit = 50) {
    const events = this.getEventsByDeviceId(deviceId, 500);
    return events.filter(e => e.severity === severity).slice(-limit);
  }

  /**
   * Get all events (across all devices)
   */
  getAllEvents() {
    try {
      if (!fs.existsSync(this.EVENTS_FILE)) {
        return [];
      }

      const data = fs.readFileSync(this.EVENTS_FILE, 'utf-8');
      return JSON.parse(data) || [];
    } catch (error) {
      console.error('Error reading events:', error);
      return [];
    }
  }

  /**
   * Get event statistics
   */
  getEventStats(deviceId) {
    const events = this.getEventsByDeviceId(deviceId, 500);

    const stats = {
      totalEvents: events.length,
      byType: {},
      bySeverity: {},
      lastEvent: events[events.length - 1] || null,
      timeSpan: {
        oldest: events[0]?.timestamp,
        newest: events[events.length - 1]?.timestamp
      }
    };

    events.forEach(event => {
      // Count by type
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
      // Count by severity
      stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Export events as CSV
   */
  exportAsCSV(deviceId, filter = {}) {
    let events = this.getEventsByDeviceId(deviceId, 500);

    // Apply filters
    if (filter.type) {
      events = events.filter(e => e.type === filter.type);
    }
    if (filter.severity) {
      events = events.filter(e => e.severity === filter.severity);
    }
    if (filter.startDate && filter.endDate) {
      const start = new Date(filter.startDate).getTime();
      const end = new Date(filter.endDate).getTime();
      events = events.filter(e => {
        const time = new Date(e.timestamp).getTime();
        return time >= start && time <= end;
      });
    }

    // Generate CSV
    let csv = 'ID,Device ID,Type,Severity,Timestamp,Data\n';
    events.forEach(event => {
      const data = JSON.stringify(event.data).replace(/"/g, '""');
      csv += `${event.id},"${event.deviceId}","${event.type}","${event.severity}","${event.timestamp}","${data}"\n`;
    });

    return csv;
  }

  /**
   * Clear old events (older than days)
   */
  clearOldEvents(deviceId, days = 30) {
    try {
      const allEvents = this.getAllEvents();
      const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

      const filtered = allEvents.filter(event => {
        if (event.deviceId !== deviceId) return true;
        return new Date(event.timestamp).getTime() > cutoffTime;
      });

      fs.writeFileSync(this.EVENTS_FILE, JSON.stringify(filtered, null, 2));
      return {
        success: true,
        deviceId,
        eventsRemoved: allEvents.length - filtered.length
      };
    } catch (error) {
      console.error('Error clearing events:', error);
      throw error;
    }
  }

  /**
   * Private: Save events to file
   */
  saveEvents(deviceId, events) {
    try {
      const allEvents = this.getAllEvents();

      // Remove old events for this device
      const otherEvents = allEvents.filter(e => e.deviceId !== deviceId);

      // Combine with new events
      const combined = [...otherEvents, ...events];

      fs.writeFileSync(this.EVENTS_FILE, JSON.stringify(combined, null, 2));
    } catch (error) {
      console.error('Error saving events:', error);
      throw error;
    }
  }

  /**
   * Private: Generate unique event ID
   */
  generateEventId() {
    return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get event type display name
   */
  getEventDisplayName(type) {
    const names = {
      [EVENT_TYPES.DEVICE_CONNECTED]: 'Dispositivo Conectado',
      [EVENT_TYPES.DEVICE_DISCONNECTED]: 'Dispositivo Desconectado',
      [EVENT_TYPES.VOLUME_CHANGED]: 'Volumen Cambiado',
      [EVENT_TYPES.PROGRAM_SWITCHED]: 'Programa Cambiado',
      [EVENT_TYPES.BATTERY_LOW]: 'Batería Baja',
      [EVENT_TYPES.BATTERY_CRITICAL]: 'Batería Crítica',
      [EVENT_TYPES.MUTE_TOGGLED]: 'Silencio Activado/Desactivado',
      [EVENT_TYPES.ERROR]: 'Error',
      [EVENT_TYPES.SETTINGS_CHANGED]: 'Configuración Cambiada',
      [EVENT_TYPES.FIRMWARE_UPDATE]: 'Actualización de Firmware',
      [EVENT_TYPES.SYNC_STARTED]: 'Sincronización Iniciada',
      [EVENT_TYPES.SYNC_COMPLETED]: 'Sincronización Completada'
    };

    return names[type] || type;
  }
}

module.exports = new EventManager();
module.exports.EVENT_TYPES = EVENT_TYPES;
module.exports.SEVERITY_LEVELS = SEVERITY_LEVELS;
