/**
 * Phonak Service
 * Manages real-time communication with Phonak hearing aids
 * Integrates device detection with control operations
 */

const phonakController = require('../bluetooth/phonak-controller');
const deviceDetector = require('./device-detector');
const logger = require('../utils/logger');

class PhonaService {
  constructor() {
    this.isInitialized = false;
    this.updateInterval = null;
  }

  /**
   * Initialize Phonak devices after detection
   */
  async initialize() {
    try {
      logger.info('🎧 Initializing Phonak devices...');

      const devices = await deviceDetector.scanDevices();

      if (devices.length === 0) {
        logger.warn('No devices found for initialization');
        return;
      }

      // Initialize each detected device
      for (const device of devices) {
        phonakController.initializeDevice(device.id, device.name);
      }

      logger.success(`✅ Initialized ${devices.length} device(s)`);
      this.isInitialized = true;

      // Start battery simulation
      this.startBatterySimulation();

      return devices;
    } catch (error) {
      logger.error('Error initializing Phonak service', error.message);
      throw error;
    }
  }

  /**
   * Start simulating battery drain
   */
  startBatterySimulation() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Simulate battery drain every 30 seconds
    this.updateInterval = setInterval(() => {
      const states = phonakController.getAllDeviceStates();
      // Battery changes are simulated in getAllDeviceStates
    }, 30000);
  }

  /**
   * Get all device states
   */
  getDeviceStates() {
    return phonakController.getAllDeviceStates();
  }

  /**
   * Get specific device state
   */
  getDeviceState(deviceId) {
    try {
      return phonakController.getDeviceState(deviceId);
    } catch (error) {
      logger.error('Error getting device state', error.message);
      throw error;
    }
  }

  /**
   * Connect to device
   */
  async connectDevice(deviceId) {
    try {
      const state = phonakController.connectDevice(deviceId);
      logger.success(`✅ Device connected: ${deviceId}`);
      return {
        success: true,
        device: state
      };
    } catch (error) {
      logger.error('Error connecting device', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Disconnect from device
   */
  async disconnectDevice(deviceId) {
    try {
      const state = phonakController.disconnectDevice(deviceId);
      logger.info(`❌ Device disconnected: ${deviceId}`);
      return {
        success: true,
        device: state
      };
    } catch (error) {
      logger.error('Error disconnecting device', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update device volume
   */
  async setVolume(deviceId, volume) {
    try {
      const state = phonakController.setVolume(deviceId, volume);
      return {
        success: true,
        device: state
      };
    } catch (error) {
      logger.error('Error setting volume', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Change audio program
   */
  async setProgram(deviceId, programName) {
    try {
      const state = phonakController.setProgram(deviceId, programName);
      return {
        success: true,
        device: state
      };
    } catch (error) {
      logger.error('Error setting program', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get available programs for device
   */
  getPrograms(deviceId) {
    try {
      return phonakController.getDevicePrograms(deviceId);
    } catch (error) {
      logger.error('Error getting programs', error.message);
      return [];
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

module.exports = new PhonaService();
