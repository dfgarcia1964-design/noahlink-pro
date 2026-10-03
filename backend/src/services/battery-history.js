const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

const HISTORY_FILE = path.join(__dirname, '../../data/battery-history.json');
const MAX_RECORDS_PER_DEVICE = 336; // 7 días a 30 minutos = 336 registros

class BatteryHistoryService {
  /**
   * Cargar historial de batería
   */
  async loadHistory() {
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.warn('Error loading battery history, returning empty', error.message);
      return {};
    }
  }

  /**
   * Guardar historial en archivo
   */
  async saveHistory(history) {
    try {
      await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
      logger.debug('Battery history saved');
    } catch (error) {
      logger.error('Error saving battery history', error.message);
      throw error;
    }
  }

  /**
   * Registrar nuevo nivel de batería
   */
  async recordBattery(deviceId, batteryData) {
    try {
      const history = await this.loadHistory();

      if (!history[deviceId]) {
        history[deviceId] = [];
      }

      // Crear registro
      const record = {
        timestamp: new Date().toISOString(),
        level: batteryData.level,
        voltage: batteryData.voltage || null,
        temperature: batteryData.temperature || null
      };

      history[deviceId].push(record);

      // Mantener solo los últimos MAX_RECORDS_PER_DEVICE registros
      if (history[deviceId].length > MAX_RECORDS_PER_DEVICE) {
        history[deviceId] = history[deviceId].slice(-MAX_RECORDS_PER_DEVICE);
      }

      await this.saveHistory(history);
      logger.info(`Battery recorded for ${deviceId}`, { level: record.level });

      return record;
    } catch (error) {
      logger.error('Error recording battery', error.message);
      throw error;
    }
  }

  /**
   * Obtener historial de los últimos N horas
   */
  async getHistory(deviceId, hoursBack = 24) {
    try {
      const history = await this.loadHistory();
      const records = history[deviceId] || [];

      if (records.length === 0) {
        return [];
      }

      const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      return records.filter(record => {
        const recordTime = new Date(record.timestamp);
        return recordTime >= cutoffTime;
      });
    } catch (error) {
      logger.error('Error getting battery history', error.message);
      return [];
    }
  }

  /**
   * Obtener últimos N registros
   */
  async getLatestRecords(deviceId, count = 10) {
    try {
      const history = await this.loadHistory();
      const records = history[deviceId] || [];
      return records.slice(-count);
    } catch (error) {
      logger.error('Error getting latest records', error.message);
      return [];
    }
  }

  /**
   * Calcular estadísticas de batería
   */
  async getStats(deviceId, hoursBack = 24) {
    try {
      const records = await this.getHistory(deviceId, hoursBack);

      if (records.length === 0) {
        return {
          current: null,
          average: null,
          min: null,
          max: null,
          trend: null,
          recordCount: 0
        };
      }

      const levels = records.map(r => r.level);
      const current = levels[levels.length - 1];
      const average = Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
      const min = Math.min(...levels);
      const max = Math.max(...levels);

      // Calcular tendencia (últimos 3 registros)
      let trend = 'stable';
      if (records.length >= 3) {
        const recentThree = levels.slice(-3);
        const avgRecent = recentThree.reduce((a, b) => a + b, 0) / 3;
        const avgBefore = levels.length >= 6
          ? levels.slice(-6, -3).reduce((a, b) => a + b, 0) / 3
          : current;

        if (avgRecent > avgBefore) {
          trend = 'improving';
        } else if (avgRecent < avgBefore) {
          trend = 'declining';
        }
      }

      return {
        current,
        average,
        min,
        max,
        trend,
        recordCount: records.length,
        timeRange: `${hoursBack}h`
      };
    } catch (error) {
      logger.error('Error calculating stats', error.message);
      return null;
    }
  }

  /**
   * Predicción simple de tiempo de duración
   */
  async predictDrainTime(deviceId) {
    try {
      const stats = await this.getStats(deviceId, 24);

      if (!stats || stats.recordCount < 2) {
        return null;
      }

      // Calcular promedio de descarga por hora
      const records = await this.getHistory(deviceId, 24);
      if (records.length < 2) {
        return null;
      }

      const firstTime = new Date(records[0].timestamp);
      const lastTime = new Date(records[records.length - 1].timestamp);
      const hoursElapsed = (lastTime - firstTime) / (1000 * 60 * 60);

      const percentDrained = records[0].level - records[records.length - 1].level;
      const drainPerHour = hoursElapsed > 0 ? percentDrained / hoursElapsed : 0;

      if (drainPerHour <= 0) {
        return {
          estimatedHours: null,
          estimatedTime: null,
          confidence: 'low'
        };
      }

      const currentLevel = stats.current;
      const estimatedHours = Math.round(currentLevel / drainPerHour);
      const estimatedTime = new Date(Date.now() + estimatedHours * 60 * 60 * 1000).toISOString();

      return {
        estimatedHours,
        estimatedTime,
        drainPerHour: drainPerHour.toFixed(2),
        confidence: records.length > 20 ? 'high' : 'medium'
      };
    } catch (error) {
      logger.error('Error predicting drain time', error.message);
      return null;
    }
  }

  /**
   * Limpiar historial antiguo
   */
  async cleanOldRecords() {
    try {
      const history = await this.loadHistory();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      for (const deviceId in history) {
        history[deviceId] = history[deviceId].filter(record => {
          return new Date(record.timestamp) >= sevenDaysAgo;
        });
      }

      await this.saveHistory(history);
      logger.info('Old battery records cleaned');
    } catch (error) {
      logger.error('Error cleaning old records', error.message);
    }
  }
}

module.exports = new BatteryHistoryService();
