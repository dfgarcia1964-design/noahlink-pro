/**
 * Device Detector Service
 * Detects REAL Phonak hearing aids via Bluetooth (Windows native)
 * Falls back to demo mode if no devices found
 */

const realDetector = require('../bluetooth/real-detector');
const logger = require('../utils/logger');

class DeviceDetector {
  constructor() {
    this.devices = [];
    this.isScanning = false;
    this.demoMode = false;
  }

  /**
   * Scan for connected devices (REAL Bluetooth)
   */
  async scanDevices() {
    this.isScanning = true;

    try {
      logger.info('🔍 Scanning for REAL Bluetooth devices...');

      // Intentar detectar dispositivos Phonak reales
      const realDevices = await realDetector.scanDevices();

      if (realDevices && realDevices.length > 0) {
        logger.success(`✅ Found ${realDevices.length} REAL Phonak device(s)`);
        this.devices = realDevices;
        this.demoMode = false;
        return realDevices;
      } else {
        logger.warn('⚠️  No real Phonak devices found. Using DEMO mode.');
        this.devices = this.getDemoDevices();
        this.demoMode = true;
        return this.devices;
      }
    } catch (error) {
      logger.error('Error scanning devices', error.message);
      logger.warn('Falling back to demo mode');
      this.devices = this.getDemoDevices();
      this.demoMode = true;
      return this.devices;
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Demo devices (fallback when no real devices found)
   */
  getDemoDevices() {
    return [
      {
        id: 'device-1',
        name: 'Phonak Sky L (L)',
        model: 'Sky L 90-UP',
        firmware: '1.0.4.0',
        battery: 99,
        rssi: -48,
        serial: '2346X3WUN',
        side: 'Izquierdo',
        source: 'Demo Mode'
      },
      {
        id: 'device-2',
        name: 'Phonak Sky L (R)',
        model: 'Sky L 90-UP',
        firmware: '1.0.4.0',
        battery: 99,
        rssi: -45,
        serial: '2344X0TMU',
        side: 'Derecho',
        source: 'Demo Mode'
      }
    ];
  }

  /**
   * Get device details (REAL or DEMO)
   */
  async getDeviceDetails(deviceId) {
    try {
      let device = this.devices.find(d => d.id === deviceId);

      if (!device) {
        return null;
      }

      // Use real detector for more details if available
      const realDetails = await realDetector.getDeviceDetails(deviceId);
      if (realDetails) {
        return realDetails;
      }

      // Fallback to demo details
      return {
        ...device,
        status: 'connected',
        lastSync: new Date(),
        battery: {
          level: device.battery || 85,
          voltage: 3.8,
          temperature: 25,
          charging: false
        },
        programs: [
          { number: 1, name: 'Automático', active: true },
          { number: 2, name: 'Conversation', active: false },
          { number: 3, name: 'Music', active: false }
        ]
      };
    } catch (error) {
      logger.error('Error getting device details', error.message);
      return null;
    }
  }

  /**
   * Connect to device (REAL Bluetooth)
   */
  async connectDevice(deviceId) {
    try {
      const result = await realDetector.connectDevice(deviceId);
      if (result.success) {
        logger.success(`✅ Connected to device`);
      }
      return result;
    } catch (error) {
      logger.error('Error connecting to device', error.message);
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
      const result = await realDetector.disconnectDevice(deviceId);
      return result;
    } catch (error) {
      logger.error('Error disconnecting', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Set volume on device (REAL Bluetooth)
   */
  async setVolume(deviceId, volume) {
    try {
      const result = await realDetector.setVolume(deviceId, volume);
      return result;
    } catch (error) {
      logger.error('Error setting volume', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Switch audio program (REAL Bluetooth)
   */
  async switchProgram(deviceId, programName) {
    try {
      const result = await realDetector.switchProgram(deviceId, programName);
      return result;
    } catch (error) {
      logger.error('Error switching program', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get battery info
   */
  async getBatteryInfo(deviceId) {
    try {
      const device = this.devices.find(d => d.id === deviceId);

      if (!device) {
        throw new Error('Device not found');
      }

      return {
        success: true,
        battery: {
          level: device.battery || 85,
          percentage: `${device.battery || 85}%`,
          voltage: 3.8,
          temperature: 25,
          charging: false,
          lastUpdate: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if running in demo mode
   */
  isDemoMode() {
    return this.demoMode;
  }

  /**
   * Get mode status
   */
  getModeStatus() {
    return {
      mode: this.demoMode ? 'DEMO' : 'REAL',
      deviceCount: this.devices.length,
      isScanning: this.isScanning,
      connectedCount: this.demoMode ? 0 : realDetector.getConnectedDevices().length
    };
  }
}

module.exports = new DeviceDetector();
