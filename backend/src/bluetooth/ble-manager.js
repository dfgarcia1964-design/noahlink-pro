// Mock Noble para Windows sin dependencias nativas
// En producción, reemplazar con librería BLE real después de Wireshark capture
const EventEmitter = require('events');
const logger = require('../utils/logger');

/**
 * BLEManager - Gestor de conexiones BLE reales con audífonos Phonak
 * Phase 2: Implementación de librería BLE
 *
 * NOTA: Usando modo simulado para testing (sin dependencias nativas)
 * En Phase 3, integrar con Noble.js real después de Wireshark capture
 */

class BLEManager extends EventEmitter {
  constructor() {
    super();
    this.connectedDevices = new Map();
    this.discoveredDevices = new Map();
    this.isScanning = false;
    this.scanTimeout = null;
    this.mockDevices = [
      { id: 'phonak-1', name: 'D-Phonak L audífono', address: 'AA:BB:CC:DD:EE:01', rssi: -55 },
      { id: 'phonak-2', name: 'D-Phonak R audífono', address: 'AA:BB:CC:DD:EE:02', rssi: -58 }
    ];

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
    // Simulación de Bluetooth (para testing)
    // En producción, esto sería reemplazado con Noble.js real

    logger.info('🔵 Bluetooth inicializado (modo simulación)');
    this.emit('state-changed', 'poweredOn');
    logger.info('✅ Bluetooth disponible');
  }

  // Simular descubrimiento de dispositivos
  _simulateDiscovery() {
    this.mockDevices.forEach(device => {
      this.discoveredDevices.set(device.id, {
        id: device.id,
        address: device.address,
        name: device.name,
        rssi: device.rssi,
        discoveredAt: new Date(),
        isConnected: false
      });

      logger.info(`📱 Audífono descubierto: ${device.name} (RSSI: ${device.rssi})`);

      this.emit('device-discovered', {
        id: device.id,
        name: device.name,
        rssi: device.rssi
      });
    });
  }

  async startScanning(duration = 10000) {
    try {
      if (this.isScanning) {
        logger.warn('⚠️ Escaneo ya en progreso');
        return;
      }

      logger.info(`🔍 Iniciando escaneo BLE (${duration}ms)...`);
      this.isScanning = true;
      this.discoveredDevices.clear();

      // Simular descubrimiento después de 500ms
      setTimeout(() => {
        if (this.isScanning) {
          this._simulateDiscovery();
        }
      }, 500);

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

      this.isScanning = false;

      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = null;
      }

      logger.info(`✅ Escaneo detenido. Dispositivos encontrados: ${this.discoveredDevices.size}`);
      this.emit('scanning-stopped', {
        devicesFound: this.discoveredDevices.size,
        devices: Array.from(this.discoveredDevices.values()).map(d => ({
          id: d.id,
          name: d.name,
          rssi: d.rssi
        }))
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

      // Simular conexión y descubrimiento de servicios
      await new Promise(resolve => setTimeout(resolve, 500));

      logger.info(`✅ Conectado a ${device.name}`);

      // Simular servicios y características
      const mockServices = [
        { uuid: '180A', name: 'Device Information' },
        { uuid: '180F', name: 'Battery Service' }
      ];

      const mockCharacteristics = [
        { uuid: '2A19', name: 'Battery Level' },
        { uuid: '2A29', name: 'Manufacturer Name String' }
      ];

      this.connectedDevices.set(deviceId, {
        ...device,
        services: mockServices,
        characteristics: mockCharacteristics,
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
        services: mockServices.length,
        characteristics: mockCharacteristics.length
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
