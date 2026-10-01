/**
 * BluetoothManager
 * Gestor centralizado de conexiones Bluetooth a audífonos Phonak
 */

const noble = require('noble');
const EventEmitter = require('events');

class BluetoothManager extends EventEmitter {
  constructor() {
    super();

    this.connectedDevice = null;
    this.isScanning = false;
    this.scanTimeout = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = parseInt(process.env.BLUETOOTH_RECONNECT_MAX_ATTEMPTS || 5);

    this.initializeBluetooth();
  }

  /**
   * Inicializar Bluetooth
   */
  initializeBluetooth() {
    // Cuando Bluetooth está listo
    noble.on('stateChange', (state) => {
      console.log(`🔵 Bluetooth state: ${state}`);
      this.emit('stateChange', state);

      if (state === 'poweredOn') {
        console.log('✅ Bluetooth listo');
      } else {
        console.warn('⚠️  Bluetooth no disponible:', state);
      }
    });

    // Error en descubrimiento
    noble.on('scanStart', () => {
      console.log('🔍 Iniciando escaneo Bluetooth...');
      this.isScanning = true;
    });

    noble.on('scanStop', () => {
      console.log('🛑 Escaneo detenido');
      this.isScanning = false;
    });

    // Detectar periféricos (audífonos)
    noble.on('discover', (peripheral) => {
      this.handleDiscoveredDevice(peripheral);
    });
  }

  /**
   * Manejar dispositivo descubierto
   */
  handleDiscoveredDevice(peripheral) {
    const { advertisement } = peripheral;
    const name = advertisement.localName || 'Unknown';

    // Filtrar por dispositivos Phonak (Naída UP 90)
    // Phonak devices típicamente tienen ciertos UUIDs o nombres
    if (this.isPhonakDevice(name, peripheral)) {
      console.log(`✨ Dispositivo Phonak encontrado: ${name} (${peripheral.id})`);

      this.emit('deviceDiscovered', {
        id: peripheral.id,
        name: name,
        rssi: peripheral.rssi,
        peripheral: peripheral,
        timestamp: new Date()
      });
    }
  }

  /**
   * Verificar si es dispositivo Phonak
   */
  isPhonakDevice(name, peripheral) {
    // Phonak device names contienen típicamente ciertos patrones
    const phonakPatterns = [
      'naida', 'paradise', 'audeo', 'bolero', 'lyric',
      'phonak', 'sky', 'up'
    ];

    const nameLower = (name || '').toLowerCase();
    return phonakPatterns.some(pattern => nameLower.includes(pattern));
  }

  /**
   * Escanear dispositivos Phonak
   */
  startScan(duration = null) {
    if (this.isScanning) {
      console.warn('⚠️  Ya hay un escaneo en progreso');
      return;
    }

    const scanDuration = duration || parseInt(process.env.BLUETOOTH_SCAN_DURATION || 10000);

    console.log(`🔍 Escaneando por ${scanDuration / 1000} segundos...`);

    noble.startScanning([], true); // Escanear sin filtro UUID

    // Auto-detener después del tiempo especificado
    this.scanTimeout = setTimeout(() => {
      this.stopScan();
    }, scanDuration);
  }

  /**
   * Detener escaneo
   */
  stopScan() {
    noble.stopScanning();
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }
  }

  /**
   * Conectar a dispositivo Phonak
   */
  async connect(peripheralId) {
    try {
      this.stopScan();

      console.log(`🔗 Conectando a dispositivo: ${peripheralId}`);

      // Encontrar el periférico por ID
      const peripheral = noble.getPeripherals().find(p => p.id === peripheralId) ||
                        this.findPeripheralById(peripheralId);

      if (!peripheral) {
        throw new Error(`Dispositivo no encontrado: ${peripheralId}`);
      }

      // Conectar
      await this.connectToPeripheral(peripheral);

      this.connectedDevice = {
        id: peripheral.id,
        name: peripheral.advertisement.localName,
        peripheral: peripheral,
        connectedAt: new Date()
      };

      console.log(`✅ Conectado a: ${this.connectedDevice.name}`);
      this.emit('connected', this.connectedDevice);

      return this.connectedDevice;

    } catch (error) {
      console.error('❌ Error conectando:', error.message);
      this.emit('connectionError', error);
      throw error;
    }
  }

  /**
   * Conectar a periférico (Promise-based)
   */
  connectToPeripheral(peripheral) {
    return new Promise((resolve, reject) => {
      peripheral.connect((error) => {
        if (error) {
          reject(error);
        } else {
          console.log('✅ Conexión Bluetooth establecida');
          resolve();
        }
      });
    });
  }

  /**
   * Encontrar periférico por ID
   */
  findPeripheralById(id) {
    // En una implementación real, buscaríamos en caché
    return null;
  }

  /**
   * Desconectar
   */
  async disconnect() {
    if (!this.connectedDevice) {
      console.warn('⚠️  No hay dispositivo conectado');
      return;
    }

    try {
      const { peripheral } = this.connectedDevice;

      return new Promise((resolve, reject) => {
        peripheral.disconnect((error) => {
          if (error) reject(error);
          else {
            console.log('✅ Desconectado');
            this.connectedDevice = null;
            this.emit('disconnected');
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('❌ Error desconectando:', error.message);
      throw error;
    }
  }

  /**
   * Leer batería del dispositivo
   */
  async readBattery() {
    if (!this.connectedDevice) {
      throw new Error('No hay dispositivo conectado');
    }

    try {
      // TODO: Implementar lectura real del nivel de batería vía BLE
      // Por ahora, retornar valor simulado para Fase 1

      const batteryLevel = Math.floor(Math.random() * 100);

      return {
        level: batteryLevel,
        percentage: `${batteryLevel}%`,
        status: batteryLevel > 50 ? 'good' : batteryLevel > 20 ? 'medium' : 'low',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Error leyendo batería:', error.message);
      throw error;
    }
  }

  /**
   * Leer información del dispositivo
   */
  async readDeviceInfo() {
    if (!this.connectedDevice) {
      throw new Error('No hay dispositivo conectado');
    }

    try {
      // TODO: Leer valores reales via BLE
      // Simular para Fase 1

      return {
        name: this.connectedDevice.name,
        serial: 'PH234567AB', // TODO: Leer real
        model: 'Naída UP 90',
        firmware: '9.2.5',
        hardwareVersion: '1.0',
        connectedAt: this.connectedDevice.connectedAt,
        signalStrength: -50 // RSSI
      };
    } catch (error) {
      console.error('❌ Error leyendo info:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar volumen
   */
  async setVolume(volume) {
    if (!this.connectedDevice) {
      throw new Error('No hay dispositivo conectado');
    }

    if (volume < 0 || volume > 100) {
      throw new Error('Volumen debe estar entre 0 y 100');
    }

    try {
      // TODO: Implementar control real de volumen vía BLE
      console.log(`🔊 Estableciendo volumen a: ${volume}%`);

      // Por ahora solo loguear
      this.emit('volumeChanged', { volume, timestamp: new Date() });

      return { volume, success: true };
    } catch (error) {
      console.error('❌ Error cambiando volumen:', error.message);
      throw error;
    }
  }

  /**
   * Verificar estado de conexión
   */
  isConnected() {
    return !!this.connectedDevice;
  }

  /**
   * Obtener dispositivo conectado
   */
  getConnectedDevice() {
    return this.connectedDevice;
  }
}

module.exports = BluetoothManager;
