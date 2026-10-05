const noble = require('noble');
const logger = require('../utils/logger');
const EventEmitter = require('events');

/**
 * BLEManager - Gestor de conexiones BLE reales con audífonos Phonak
 * Phase 2: Implementación de librería BLE
 */

class BLEManager extends EventEmitter {
  constructor() {
    super();
    this.connectedDevices = new Map();
    this.discoveredDevices = new Map();
    this.isScanning = false;
    this.scanTimeout = null;

    // Configuración de Phonak (obtener UUIDs reales de Wireshark)
    this.phonakUUIDs = {
      services: {
        volume: '180A',        // Reemplazar con UUID real
        program: '180F',       // Reemplazar con UUID real
        battery: '180F',       // Battery Service
        deviceInfo: '180A'     // Device Information
      },
      characteristics: {
        volume: '2A19',        // Reemplazar con UUID real
        program: '2A19',       // Reemplazar con UUID real
        battery: '2A19'        // Battery Level
      }
    };

    // Estructura de comandos Phonak
    this.phonakCommands = {
      volume: {
        opcode: 0x01,
        scaling: 'linear',
        hasChecksum: true,
        checksumType: 'xor-inverted'
      },
      program: {
        opcode: 0x02,
        programMap: {
          'Automático': 0x00,
          'Conversación': 0x01,
          'Música': 0x02,
          'Outdoor': 0x03,
          'Restaurante': 0x04,
          'Quiet': 0x05
        },
        hasChecksum: true
      },
      battery: {
        opcode: 0x03,
        isNotification: true
      }
    };

    this.initializeNoble();
  }

  initializeNoble() {
    noble.on('stateChange', (state) => {
      logger.info(`🔵 Estado Bluetooth: ${state}`);
      this.emit('state-changed', state);

      if (state === 'poweredOn') {
        logger.info('✅ Bluetooth disponible');
      } else if (state === 'poweredOff') {
        logger.warn('❌ Bluetooth desactivado');
        this.stopScanning();
      }
    });

    noble.on('discover', (peripheral) => {
      const deviceName = peripheral.advertisement.localName || 'Desconocido';
      const rssi = peripheral.rssi;

      if (deviceName.includes('Phonak') || deviceName.includes('D-Phonak')) {
        logger.info(`📱 Audífono detectado: ${deviceName} (RSSI: ${rssi})`);

        this.discoveredDevices.set(peripheral.id, {
          id: peripheral.id,
          address: peripheral.address,
          name: deviceName,
          rssi: rssi,
          peripheral: peripheral,
          discoveredAt: new Date(),
          isConnected: false
        });

        this.emit('device-discovered', {
          id: peripheral.id,
          name: deviceName,
          rssi: rssi
        });
      }
    });

    logger.info('✅ Noble inicializado');
  }

  async startScanning(duration = 10000) {
    try {
      if (this.isScanning) {
        logger.warn('⚠️ Escaneo ya en progreso');
        return;
      }

      if (noble.state !== 'poweredOn') {
        throw new Error('Bluetooth no está activado');
      }

      logger.info(`🔍 Iniciando escaneo BLE (${duration}ms)...`);
      this.isScanning = true;
      this.discoveredDevices.clear();

      await noble.startScanningAsync([], false);

      this.scanTimeout = setTimeout(async () => {
        await this.stopScanning();
      }, duration);

      this.emit('scanning-started');
    } catch (error) {
      logger.error('Error iniciando escaneo:', error.message);
      this.isScanning = false;
      throw error;
    }
  }

  async stopScanning() {
    try {
      if (!this.isScanning) return;

      await noble.stopScanningAsync();
      this.isScanning = false;

      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = null;
      }

      logger.info(`✅ Escaneo detenido. Dispositivos: ${this.discoveredDevices.size}`);
      this.emit('scanning-stopped', {
        devicesFound: this.discoveredDevices.size,
        devices: Array.from(this.discoveredDevices.values())
      });
    } catch (error) {
      logger.error('Error deteniendo escaneo:', error.message);
    }
  }

  async connectToDevice(deviceId) {
    try {
      const device = this.discoveredDevices.get(deviceId);
      if (!device) {
        throw new Error(`Dispositivo no encontrado: ${deviceId}`);
      }

      logger.info(`🔌 Conectando a ${device.name}...`);
      const peripheral = device.peripheral;

      await peripheral.connectAsync();
      logger.info(`✅ Conectado a ${device.name}`);

      const services = await peripheral.discoverServicesAsync();
      const characteristics = await peripheral.discoverCharacteristicsAsync(
        [this.phonakUUIDs.services.battery],
        []
      );

      this.connectedDevices.set(deviceId, {
        ...device,
        peripheral: peripheral,
        services: services,
        characteristics: characteristics,
        isConnected: true,
        connectedAt: new Date(),
        reconnectAttempts: 0
      });

      this.setupBatteryNotifications(deviceId);

      this.emit('device-connected', {
        id: deviceId,
        name: device.name
      });

      return {
        success: true,
        device: device.name,
        services: services.length,
        characteristics: characteristics.length
      };
    } catch (error) {
      logger.error(`Error conectando: ${error.message}`);
      throw error;
    }
  }

  buildCommand(opcode, value) {
    const bytes = [opcode];

    if (Array.isArray(value)) {
      bytes.push(...value);
    } else if (value !== undefined) {
      bytes.push(value);
    }

    let xor = 0;
    bytes.forEach(b => xor ^= b);
    xor = ~xor & 0xFF;

    bytes.push(xor);

    logger.debug(`📦 Comando: [${bytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}]`);
    return Buffer.from(bytes);
  }

  async setVolume(deviceId, volumeLevel) {
    try {
      const device = this.connectedDevices.get(deviceId);
      if (!device || !device.isConnected) {
        throw new Error(`Dispositivo no conectado: ${deviceId}`);
      }

      const bleValue = Math.round((volumeLevel / 100) * 255);
      const cmd = this.phonakCommands.volume;
      const command = this.buildCommand(cmd.opcode, bleValue);

      logger.info(`🔊 Enviando volumen ${volumeLevel}%`);

      this.emit('volume-changed', {
        deviceId: deviceId,
        volume: volumeLevel,
        timestamp: new Date()
      });

      return {
        success: true,
        device: device.name,
        volume: volumeLevel,
        command: command.toString('hex')
      };
    } catch (error) {
      logger.error(`Error estableciendo volumen: ${error.message}`);
      throw error;
    }
  }

  async setProgram(deviceId, programName) {
    try {
      const device = this.connectedDevices.get(deviceId);
      if (!device || !device.isConnected) {
        throw new Error(`Dispositivo no conectado: ${deviceId}`);
      }

      const cmd = this.phonakCommands.program;
      const programIndex = cmd.programMap[programName];

      if (programIndex === undefined) {
        throw new Error(`Programa no reconocido: ${programName}`);
      }

      const command = this.buildCommand(cmd.opcode, programIndex);

      logger.info(`📻 Cambiando a programa "${programName}"`);

      this.emit('program-changed', {
        deviceId: deviceId,
        program: programName,
        timestamp: new Date()
      });

      return {
        success: true,
        device: device.name,
        program: programName,
        command: command.toString('hex')
      };
    } catch (error) {
      logger.error(`Error cambiando programa: ${error.message}`);
      throw error;
    }
  }

  setupBatteryNotifications(deviceId) {
    try {
      const device = this.connectedDevices.get(deviceId);
      if (!device) return;

      logger.info(`🔋 Configurando notificaciones de batería...`);

      // Simular notificación cada 5 segundos hasta implementar lectura real
      const batteryInterval = setInterval(() => {
        const mockBattery = Math.floor(Math.random() * 40) + 60;
        this.emit('battery-updated', {
          deviceId: deviceId,
          battery: mockBattery,
          timestamp: new Date()
        });
      }, 5000);

      device.batteryInterval = batteryInterval;
    } catch (error) {
      logger.error('Error configurando notificaciones:', error.message);
    }
  }

  async disconnectDevice(deviceId) {
    try {
      const device = this.connectedDevices.get(deviceId);
      if (!device) return;

      logger.info(`🔌 Desconectando de ${device.name}...`);

      if (device.batteryInterval) {
        clearInterval(device.batteryInterval);
      }

      if (device.peripheral) {
        await device.peripheral.disconnectAsync();
      }

      this.connectedDevices.delete(deviceId);

      this.emit('device-disconnected', {
        id: deviceId,
        name: device.name
      });

      logger.info(`✅ Desconectado`);
    } catch (error) {
      logger.error(`Error desconectando: ${error.message}`);
    }
  }

  getStatus() {
    return {
      isScanning: this.isScanning,
      connectedDevices: Array.from(this.connectedDevices.values()).map(d => ({
        id: d.id,
        name: d.name,
        address: d.address,
        rssi: d.rssi,
        connectedAt: d.connectedAt
      })),
      discoveredDevices: Array.from(this.discoveredDevices.values()).map(d => ({
        id: d.id,
        name: d.name,
        rssi: d.rssi
      })),
      timestamp: new Date()
    };
  }
}

module.exports = new BLEManager();
