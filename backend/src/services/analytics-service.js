const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '../../data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics-cache.json');

class AnalyticsService {
  constructor() {
    this.analyticsCache = this.loadAnalytics();
  }

  loadAnalytics() {
    try {
      if (fs.existsSync(ANALYTICS_FILE)) {
        return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
      }
    } catch (err) {
      logger.warn('Error loading analytics cache');
    }
    return {};
  }

  saveAnalytics() {
    try {
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(this.analyticsCache, null, 2));
    } catch (err) {
      logger.error('Error saving analytics cache', err);
    }
  }

  calculateUsageStats(deviceId, days = 7) {
    const eventsFile = path.join(DATA_DIR, 'events.json');
    let events = [];

    try {
      if (fs.existsSync(eventsFile)) {
        const data = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
        events = data[deviceId] || [];
      }
    } catch (err) {
      logger.error('Error reading events', err);
    }

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => new Date(e.timestamp) > cutoffDate);

    const sessions = this.calculateSessions(recentEvents);
    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0);

    const programSwitches = recentEvents.filter(e => e.type === 'program_switch');
    const programUsage = {};
    programSwitches.forEach(e => {
      const prog = e.data?.newProgram || 'unknown';
      programUsage[prog] = (programUsage[prog] || 0) + 1;
    });

    const volumeEvents = recentEvents.filter(e => e.type === 'volume');
    const volumes = volumeEvents.map(e => e.data?.newVolume || 50);
    const volumeStats = {
      average: volumes.length > 0 ? Math.round(volumes.reduce((a, b) => a + b) / volumes.length) : 0,
      min: volumes.length > 0 ? Math.min(...volumes) : 0,
      max: volumes.length > 0 ? Math.max(...volumes) : 0
    };

    return {
      deviceId,
      period: `${days}d`,
      totalUsageHours: parseFloat(totalHours.toFixed(1)),
      sessionCount: sessions.length,
      averageSessionLength: sessions.length > 0 ? parseFloat((totalHours / sessions.length).toFixed(1)) : 0,
      activeSessions: sessions.filter(s => s.active).length,
      sessionsPerDay: parseFloat((sessions.length / days).toFixed(1)),
      programUsage: this.normalizePercentages(programUsage),
      volumeStats,
      timestamp: new Date().toISOString()
    };
  }

  calculateBatteryPrediction(deviceId) {
    const batteryFile = path.join(DATA_DIR, 'battery-history.json');
    let history = [];

    try {
      if (fs.existsSync(batteryFile)) {
        const data = JSON.parse(fs.readFileSync(batteryFile, 'utf8'));
        history = data[deviceId] || [];
      }
    } catch (err) {
      logger.error('Error reading battery history', err);
    }

    if (history.length < 2) {
      return {
        hoursRemaining: null,
        projection: [],
        accuracy: 0,
        message: 'Insufficient data'
      };
    }

    const lastRecord = history[history.length - 1];
    const firstRecord = history[0];
    const timeDiffHours = (new Date(lastRecord.timestamp) - new Date(firstRecord.timestamp)) / (1000 * 60 * 60);
    const batteryDiff = firstRecord.level - lastRecord.level;
    const drainRate = timeDiffHours > 0 ? batteryDiff / timeDiffHours : 0;

    const currentBattery = lastRecord.level;
    const hoursRemaining = drainRate > 0 ? currentBattery / drainRate : null;

    const projection = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const projectedBattery = Math.max(0, currentBattery - (drainRate * i));
      projection.push({
        hour: i,
        battery: parseFloat(projectedBattery.toFixed(1)),
        time: new Date(now.getTime() + i * 60 * 60 * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      });
    }

    return {
      deviceId,
      currentBattery,
      drainRate: parseFloat(drainRate.toFixed(2)),
      hoursRemaining: hoursRemaining ? parseFloat(hoursRemaining.toFixed(1)) : null,
      hoursRemainingFormatted: hoursRemaining ? this.formatHours(hoursRemaining) : 'Desconocido',
      projection,
      accuracy: Math.min(100, Math.max(0, 95 - (24 - history.length))),
      confidence: 'Media',
      lastUpdate: lastRecord.timestamp
    };
  }

  generateComparison(deviceIds) {
    return deviceIds.map(deviceId => ({
      deviceId,
      usageStats: this.calculateUsageStats(deviceId, 7),
      batteryStats: this.calculateBatteryPrediction(deviceId)
    }));
  }

  getSessionAnalytics(deviceId, date) {
    const eventsFile = path.join(DATA_DIR, 'events.json');
    let events = [];

    try {
      if (fs.existsSync(eventsFile)) {
        const data = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
        events = (data[deviceId] || []).filter(e => {
          const eventDate = new Date(e.timestamp).toDateString();
          return eventDate === new Date(date).toDateString();
        });
      }
    } catch (err) {
      logger.error('Error reading events', err);
    }

    return {
      deviceId,
      date,
      eventCount: events.length,
      events: events.slice(-20),
      summary: {
        programSwitches: events.filter(e => e.type === 'program_switch').length,
        volumeChanges: events.filter(e => e.type === 'volume').length,
        connectionEvents: events.filter(e => e.type === 'connection').length,
        errors: events.filter(e => e.severity === 'critical').length
      }
    };
  }

  detectAnomalies(deviceId, timeRange = 7) {
    const stats = this.calculateUsageStats(deviceId, timeRange);
    const prediction = this.calculateBatteryPrediction(deviceId);
    const anomalies = [];

    if (prediction.drainRate > 5) {
      anomalies.push({
        type: 'high-drain',
        severity: 'warning',
        message: `Alto consumo de batería: ${prediction.drainRate}%/h`,
        recommendation: 'Reducir volumen o cambiar a programa de bajo consumo'
      });
    }

    if (prediction.hoursRemaining && prediction.hoursRemaining < 4) {
      anomalies.push({
        type: 'low-battery',
        severity: 'critical',
        message: `Batería baja: ${prediction.hoursRemaining} horas restantes`,
        recommendation: 'Cargar dispositivo pronto'
      });
    }

    if (stats.volumeStats.average > 85) {
      anomalies.push({
        type: 'high-volume',
        severity: 'info',
        message: `Volumen promedio alto: ${stats.volumeStats.average}%`,
        recommendation: 'Considerar reducir volumen para mejorar la duración de la batería'
      });
    }

    return { deviceId, timeRange, anomalies };
  }

  exportAnalyticsReport(deviceId, format = 'json') {
    const stats = this.calculateUsageStats(deviceId, 30);
    const prediction = this.calculateBatteryPrediction(deviceId);
    const anomalies = this.detectAnomalies(deviceId, 30);

    const report = {
      deviceId,
      generatedAt: new Date().toISOString(),
      usageStats: stats,
      batteryPrediction: prediction,
      anomalies: anomalies.anomalies,
      summary: {
        period: '30 días',
        totalUsage: `${stats.totalUsageHours} horas`,
        averageSession: `${stats.averageSessionLength} horas`,
        predictedHours: prediction.hoursRemaining,
        warnings: anomalies.anomalies.length
      }
    };

    return report;
  }

  calculateSessions(events) {
    const sessions = [];
    let currentSession = null;

    events
      .filter(e => ['program_switch', 'volume', 'connection'].includes(e.type))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .forEach(event => {
        if (!currentSession) {
          currentSession = {
            startTime: event.timestamp,
            active: true,
            duration: 0
          };
        } else {
          const timeDiff = (new Date(event.timestamp) - new Date(currentSession.startTime)) / (1000 * 60);
          if (timeDiff > 30) {
            currentSession.endTime = event.timestamp;
            currentSession.duration = timeDiff / 60;
            currentSession.active = false;
            sessions.push(currentSession);
            currentSession = null;
          }
        }
      });

    if (currentSession) {
      currentSession.endTime = new Date().toISOString();
      currentSession.duration = (new Date(currentSession.endTime) - new Date(currentSession.startTime)) / (1000 * 60 * 60);
      sessions.push(currentSession);
    }

    return sessions;
  }

  normalizePercentages(obj) {
    const total = Object.values(obj).reduce((a, b) => a + b, 0);
    const normalized = {};
    Object.entries(obj).forEach(([key, value]) => {
      normalized[key] = total > 0 ? Math.round((value / total) * 100) : 0;
    });
    return normalized;
  }

  formatHours(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }
}

module.exports = new AnalyticsService();
