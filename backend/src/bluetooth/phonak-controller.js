/**
 * Phonak Hearing Aid Controller
 * Simulates real device control with realistic data changes
 * Ready for real BLE implementation when native libraries are available
 */

const logger = require('../utils/logger');

class PhonaDeviceState {
  constructor(deviceId, deviceName) {
    this.deviceId = deviceId;
    this.deviceName = deviceName;
    this.connected = false;
    this.battery = Math.floor(Math.random() * 40 + 60); // 60-100%
    this.volume = 75;
    this.program = 'Conversation';
    this.lastUpdate = new Date();
    this.programs = [
      { name: 'Automático', number: 1 },
      { name: 'Conversation', number: 2 },
      { name: 'Music', number: 3 },
      { name: 'Outdoor', number: 4 },
      { name: 'Restaurant', number: 5 },
      { name: 'Quiet', number: 6 }
    ];
  }

  setVolume(newVolume) {
    if (newVolume < 0 || newVolume > 100) {
      throw new Error('Volume must be between 0 and 100');
    }
    this.volume = newVolume;
    this.lastUpdate = new Date();
    logger.info(`📢 ${this.deviceName}: Volume changed to ${newVolume}%`);
    return this.volume;
  }

  setProgram(programName) {
    const program = this.programs.find(p => p.name === programName);
    if (!program) {
      throw new Error(`Invalid program: ${programName}`);
    }
    this.program = programName;
    this.lastUpdate = new Date();
    logger.info(`🎵 ${this.deviceName}: Program changed to ${programName}`);
    return this.program;
  }

  // Simula descarga de batería
  simulateBatteryDrain() {
    if (this.connected && Math.random() > 0.95) {
      this.battery = Math.max(this.battery - 1, 0);
    }
  }

  getState() {
    return {
      deviceId: this.deviceId,
      name: this.deviceName,
      connected: this.connected,
      battery: this.battery,
      volume: this.volume,
      program: this.program,
      lastUpdate: this.lastUpdate
    };
  }
}

class PhonaController {
  constructor() {
    this.devices = new Map();
  }

  initializeDevice(deviceId, deviceName) {
    if (!this.devices.has(deviceId)) {
      const device = new PhonaDeviceState(deviceId, deviceName);
      this.devices.set(deviceId, device);
      logger.info(`🎧 Initialized device: ${deviceName}`);
    }
    return this.devices.get(deviceId);
  }

  connectDevice(deviceId) {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }
    device.connected = true;
    device.lastUpdate = new Date();
    logger.success(`✅ Connected to ${device.deviceName}`);
    return device.getState();
  }

  disconnectDevice(deviceId) {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }
    device.connected = false;
    device.lastUpdate = new Date();
    logger.info(`❌ Disconnected from ${device.deviceName}`);
    return device.getState();
  }

  setVolume(deviceId, volume) {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }
    device.setVolume(volume);
    return device.getState();
  }

  setProgram(deviceId, programName) {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }
    device.setProgram(programName);
    return device.getState();
  }

  getDeviceState(deviceId) {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }
    device.simulateBatteryDrain();
    return device.getState();
  }

  getAllDeviceStates() {
    const states = [];
    this.devices.forEach(device => {
      device.simulateBatteryDrain();
      states.push(device.getState());
    });
    return states;
  }

  getDevicePrograms(deviceId) {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }
    return device.programs;
  }
}

module.exports = new PhonaController();
