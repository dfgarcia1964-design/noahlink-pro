const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const BATTERY_HISTORY_FILE = path.join(DATA_DIR, 'battery-history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class BatteryManager {
  constructor() {
    this.deviceBatteries = {};
    this.initializeBatteries();
  }

  initializeBatteries() {
    // Initialize with mock data for common device IDs
    this.deviceBatteries = {
      'sky-l-90-up-left': 85,
      'sky-r-90-up-right': 82,
      'phonak-device-1': 78,
      'test-device-id': 75
    };
  }

  getBatteryLevel(deviceId) {
    return this.deviceBatteries[deviceId] || 50;
  }

  setBatteryLevel(deviceId, level) {
    if (level < 0) level = 0;
    if (level > 100) level = 100;
    this.deviceBatteries[deviceId] = level;
    this.recordHistory(deviceId, level);
  }

  // Simulate gradual battery drain
  drainBattery(deviceId, amount = 0.1) {
    const current = this.getBatteryLevel(deviceId);
    const newLevel = Math.max(0, current - amount);
    this.setBatteryLevel(deviceId, newLevel);
    return newLevel;
  }

  // Record battery level in history
  recordHistory(deviceId, level) {
    try {
      let history = [];

      if (fs.existsSync(BATTERY_HISTORY_FILE)) {
        const data = fs.readFileSync(BATTERY_HISTORY_FILE, 'utf-8');
        history = JSON.parse(data);
      }

      // Add new entry
      history.push({
        deviceId,
        level: Math.round(level),
        timestamp: new Date().toISOString()
      });

      // Keep only last 24 hours
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      history = history.filter(h => new Date(h.timestamp).getTime() > oneDayAgo);

      fs.writeFileSync(BATTERY_HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Error recording battery history:', error);
    }
  }

  // Get battery history for a device
  getHistory(deviceId, hours = 24) {
    try {
      if (!fs.existsSync(BATTERY_HISTORY_FILE)) {
        return [];
      }

      const data = fs.readFileSync(BATTERY_HISTORY_FILE, 'utf-8');
      let history = JSON.parse(data);

      // Filter by device and time range
      const timeLimit = Date.now() - hours * 60 * 60 * 1000;
      history = history.filter(h =>
        h.deviceId === deviceId &&
        new Date(h.timestamp).getTime() > timeLimit
      );

      return history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } catch (error) {
      console.error('Error reading battery history:', error);
      return [];
    }
  }

  // Get battery status
  getBatteryStatus(level) {
    if (level >= 75) return { status: 'excellent', label: 'Excelente' };
    if (level >= 50) return { status: 'good', label: 'Bueno' };
    if (level >= 25) return { status: 'warning', label: 'Bajo' };
    return { status: 'critical', label: 'Crítico' };
  }
}

module.exports = new BatteryManager();
