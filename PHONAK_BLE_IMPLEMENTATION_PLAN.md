# 🔧 Plan de Implementación: Integración BLE Real en NoahLink Pro

**Plan detallado para implementar control Bluetooth real de audífonos Phonak**

---

## 📊 Estado Actual del Proyecto

```
✅ Completado:
  - UI Dashboard funcional
  - Backend simulado operativo
  - WebSocket infrastructure
  - Autenticación JWT
  - Database MongoDB
  - Electron app desktop

❌ Pendiente:
  - Control BLE real
  - Captura de tráfico BLE
  - Reverse engineering de protocolo
  - Integración con audífonos reales
```

---

## 🚀 Fases de Implementación

### FASE 1: Investigación (3-5 días)

#### 1.1 Captura de Tráfico BLE

**Tareas:**
```
[ ] Instalar Wireshark 4.0+ + Npcap
[ ] Configurar adaptador Bluetooth
[ ] Ejecutar Phonak Target
[ ] Conectar audífonos Phonak
[ ] Capturar cambios de volumen (5 capturas: 0%, 25%, 50%, 75%, 100%)
[ ] Capturar cambios de programa (5 programas diferentes)
[ ] Capturar notificaciones de batería (1 minuto continuo)
[ ] Exportar capturas en formato PCAP
```

**Archivos a generar:**
- `captures/phonak_volume_capture.pcapng`
- `captures/phonak_program_capture.pcapng`
- `captures/phonak_battery_capture.pcapng`

#### 1.2 Análisis de Estructura de Comandos

**Tareas:**
```
[ ] Usar script Python para extraer valores HEX de captura
[ ] Identificar patrón de volumen (byte por byte)
[ ] Identificar patrón de programa
[ ] Calcular fórmula de checksum
[ ] Validar con múltiples ejemplos
[ ] Documentar con 100% de certeza
```

**Script Python:** `tools/analyze_wireshark_capture.py`

```python
#!/usr/bin/env python3
"""
Script para analizar capturas de Wireshark
Extrae valores GATT y busca patrones
"""

import sys
import re
from collections import defaultdict

def extract_ble_values(pcapng_file):
    """Extraer valores GATT de archivo PCAP"""
    
    # Usar tshark para exportar
    import subprocess
    
    cmd = [
        'tshark', '-r', pcapng_file,
        '-Y', 'btatt.opcode == 0x12',
        '-T', 'fields', '-e', 'btatt.value'
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    values = []
    for line in result.stdout.strip().split('\n'):
        if line:
            hex_bytes = bytes.fromhex(line.replace(' ', ''))
            values.append(hex_bytes)
    
    return values

def analyze_pattern(values):
    """Analizar patrón de valores"""
    
    print("[*] Analizando patrón...")
    print(f"    Total de comandos: {len(values)}")
    
    # Agrupar por tamaño
    by_size = defaultdict(list)
    for v in values:
        by_size[len(v)].append(v)
    
    print("\n[*] Distribución por tamaño:")
    for size in sorted(by_size.keys()):
        print(f"    {size} bytes: {len(by_size[size])} comandos")
    
    # Analizar 4-byte commands
    four_byte = by_size.get(4, [])
    if four_byte:
        print("\n[*] Analizando comandos de 4 bytes:")
        print("    Formato esperado: [OPCODE][VALOR][VALIDACIÓN][CHECKSUM]")
        print()
        
        for cmd in four_byte[:10]:
            print(f"    {cmd.hex().upper()} ", end="")
            
            # Probar checksum XOR
            xor = cmd[0] ^ cmd[1] ^ cmd[2]
            inv_xor = (~xor) & 0xFF
            
            if inv_xor == cmd[3]:
                print(f"✓ XOR válido (byte[1]={cmd[1]:3d}=0x{cmd[1]:02X})")
            else:
                print(f"✗ XOR no válido")
    
    # Analizar 3-byte commands
    three_byte = by_size.get(3, [])
    if three_byte:
        print("\n[*] Analizando comandos de 3 bytes:")
        print("    Formato esperado: [OPCODE][VALOR][CHECKSUM]")
        print()
        
        for cmd in three_byte[:10]:
            print(f"    {cmd.hex().upper()} ", end="")
            
            xor = cmd[0] ^ cmd[1]
            inv_xor = (~xor) & 0xFF
            
            if inv_xor == cmd[2]:
                print(f"✓ XOR válido (byte[1]={cmd[1]:3d}=0x{cmd[1]:02X})")
            else:
                print(f"✗ XOR no válido")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python analyze_ble.py <archivo.pcapng>")
        sys.exit(1)
    
    pcap_file = sys.argv[1]
    values = extract_ble_values(pcap_file)
    analyze_pattern(values)
```

#### 1.3 Documentación de Hallazgos

**Documento:** `docs/BLE_REVERSE_ENGINEERING_RESULTS.md`

```markdown
# Resultados de Reverse Engineering BLE Phonak

## Captura 1: Volumen 0-100%

**Archivo captura:** phonak_volume_capture.pcapng

### Datos extraídos:

| Volumen % | Valor HEX | Byte 1 | Byte 2 | Byte 3 | Checksum | Patrón |
|-----------|-----------|--------|--------|--------|----------|--------|
| 0% | ? | ? | ? | ? | ? | |
| 25% | ? | ? | ? | ? | ? | |
| 50% | ? | ? | ? | ? | ? | |
| 75% | ? | ? | ? | ? | ? | |
| 100% | ? | ? | ? | ? | ? | |

### Conclusión:
[Llenar después de captura real]
```

---

### FASE 2: Implementación de Librería BLE (3-5 días)

#### 2.1 Configurar Dependencias

**Instalar paquetes Node.js:**

```bash
cd backend

# Librería BLE principal
npm install @noble/bluetooth

# Alternativas/complementarios
npm install bluetooth-hci-socket
npm install node-hci

# Utilidades
npm install eventemitter2
npm install debug
```

#### 2.2 Crear BLE Manager

**Archivo:** `backend/src/bluetooth/ble-manager.js`

```javascript
/**
 * BLE Manager
 * Gestiona conexiones Bluetooth a audífonos Phonak
 */

const { createBluetooth } = require('@noble/bluetooth');
const EventEmitter = require('events');

class BLEManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      timeout: options.timeout || 5000,
      reconnectAttempts: options.reconnectAttempts || 5,
      reconnectDelay: options.reconnectDelay || 500,
      ...options
    };
    
    this.devices = new Map();          // MAC -> device
    this.characteristics = new Map();   // UUID -> characteristic
    this.activeConnections = new Set();
    
    this.bluetooth = null;
    this.initialized = false;
  }
  
  /**
   * Inicializar Bluetooth
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      this.bluetooth = createBluetooth();
      await this.bluetooth.startScanning();
      this.initialized = true;
      
      console.log('[BLE] Bluetooth inicializado correctamente');
      this.emit('initialized');
      
    } catch (error) {
      console.error('[BLE] Error al inicializar:', error);
      throw error;
    }
  }
  
  /**
   * Escanear dispositivos Phonak
   */
  async scanForPhonakDevices(timeoutMs = 10000) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      const phonakDevices = [];
      
      // Escuchar descubrimientos
      const discoverHandler = (peripheral) => {
        const name = peripheral.advertisement?.localName || '';
        
        // Filtrar solo dispositivos Phonak
        if (name.toLowerCase().includes('phonak') || 
            this.isPhonakMAC(peripheral.address)) {
          
          phonakDevices.push({
            name: name,
            address: peripheral.address,
            rssi: peripheral.rssi,
            txPower: peripheral.advertisement?.txPowerLevel,
            advertisedServiceUUIDs: peripheral.advertisement?.serviceUUIDs,
            peripheral: peripheral,
            timestamp: new Date()
          });
          
          this.emit('device-found', { name, address: peripheral.address });
          console.log(`[+] Dispositivo Phonak encontrado: ${name} (${peripheral.address})`);
        }
      };
      
      // Configurar listener
      this.bluetooth.on('discover', discoverHandler);
      
      // Esperar a que terminar tiempo
      await new Promise(resolve => setTimeout(resolve, timeoutMs));
      
      // Limpiar listener
      this.bluetooth.removeListener('discover', discoverHandler);
      
      console.log(`[*] Escaneo completado. ${phonakDevices.length} dispositivos encontrados.`);
      
      return phonakDevices;
      
    } catch (error) {
      console.error('[BLE] Error en escaneo:', error);
      throw error;
    }
  }
  
  /**
   * Verificar si MAC es de Phonak
   */
  isPhonakMAC(mac) {
    const phonakPrefixes = [
      'D0:8C:F1',
      '4C:65:A8',
      '7C:2F:80',
      'AC:DE:48'
    ];
    
    return phonakPrefixes.some(prefix => mac.startsWith(prefix));
  }
  
  /**
   * Conectar a dispositivo
   */
  async connect(address, options = {}) {
    try {
      // Buscar dispositivo
      const device = await this.discoverDevice(address);
      
      if (!device) {
        throw new Error(`Dispositivo no encontrado: ${address}`);
      }
      
      // Conectar
      await device.connect();
      
      // Guardar referencia
      this.devices.set(address, device);
      this.activeConnections.add(address);
      
      // Descubrir servicios
      const services = await device.discoverServices();
      
      // Descubrir características
      for (const service of services) {
        const characteristics = await service.discoverCharacteristics();
        
        for (const char of characteristics) {
          this.characteristics.set(char.uuid, {
            characteristic: char,
            service: service,
            device: address,
            properties: char.properties
          });
        }
      }
      
      console.log(`[+] Conectado a ${address}`);
      this.emit('connected', { address, device });
      
      return {
        address: address,
        device: device,
        services: services.map(s => s.uuid),
        connected: true
      };
      
    } catch (error) {
      console.error(`[-] Error al conectar: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Descubrir dispositivo (sin conectar)
   */
  async discoverDevice(address, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout descubriendo ${address}`));
      }, timeoutMs);
      
      const handler = (peripheral) => {
        if (peripheral.address === address) {
          clearTimeout(timeout);
          this.bluetooth.removeListener('discover', handler);
          resolve(peripheral);
        }
      };
      
      this.bluetooth.on('discover', handler);
    });
  }
  
  /**
   * Desconectar
   */
  async disconnect(address) {
    try {
      const device = this.devices.get(address);
      
      if (device) {
        await device.disconnect();
        this.devices.delete(address);
        this.activeConnections.delete(address);
        
        console.log(`[+] Desconectado de ${address}`);
        this.emit('disconnected', { address });
      }
      
    } catch (error) {
      console.error(`[-] Error al desconectar: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Escribir valor a característica
   */
  async writeCharacteristic(address, serviceUUID, charUUID, value) {
    try {
      const device = this.devices.get(address);
      
      if (!device) {
        throw new Error(`Dispositivo no conectado: ${address}`);
      }
      
      // Encontrar servicio
      const service = await device.getService(serviceUUID);
      const characteristic = await service.getCharacteristic(charUUID);
      
      // Escribir
      await characteristic.writeValue(value);
      
      console.log(`[>] Escribir ${value.toString('hex')} a ${charUUID}`);
      
      return {
        success: true,
        address: address,
        service: serviceUUID,
        characteristic: charUUID,
        value: value.toString('hex')
      };
      
    } catch (error) {
      console.error(`[-] Error escribiendo: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Leer valor de característica
   */
  async readCharacteristic(address, serviceUUID, charUUID) {
    try {
      const device = this.devices.get(address);
      
      if (!device) {
        throw new Error(`Dispositivo no conectado: ${address}`);
      }
      
      const service = await device.getService(serviceUUID);
      const characteristic = await service.getCharacteristic(charUUID);
      
      const value = await characteristic.readValue();
      
      console.log(`[<] Lectura de ${charUUID}: ${value.toString('hex')}`);
      
      return {
        address: address,
        service: serviceUUID,
        characteristic: charUUID,
        value: value,
        valueHex: value.toString('hex'),
        valueDecimal: [...value]
      };
      
    } catch (error) {
      console.error(`[-] Error leyendo: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Suscribirse a notificaciones
   */
  async subscribeToNotifications(address, serviceUUID, charUUID, callback) {
    try {
      const device = this.devices.get(address);
      
      if (!device) {
        throw new Error(`Dispositivo no conectado: ${address}`);
      }
      
      const service = await device.getService(serviceUUID);
      const characteristic = await service.getCharacteristic(charUUID);
      
      // Subscribir
      await characteristic.subscribe();
      
      // Listener
      characteristic.on('valuechanged', (value) => {
        console.log(`[!] Notificación ${charUUID}: ${value.toString('hex')}`);
        callback(value);
      });
      
      console.log(`[*] Suscrito a ${charUUID}`);
      
      return {
        success: true,
        address: address,
        service: serviceUUID,
        characteristic: charUUID
      };
      
    } catch (error) {
      console.error(`[-] Error suscribiendo: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Obtener dispositivos activos
   */
  getActiveDevices() {
    return Array.from(this.activeConnections).map(address => ({
      address: address,
      connected: this.devices.has(address),
      device: this.devices.get(address)
    }));
  }
  
  /**
   * Shutdown
   */
  async shutdown() {
    try {
      // Desconectar todos
      for (const address of this.activeConnections) {
        await this.disconnect(address);
      }
      
      if (this.bluetooth) {
        await this.bluetooth.stopScanning();
      }
      
      console.log('[BLE] Bluetooth apagado correctamente');
      
    } catch (error) {
      console.error('[BLE] Error al apagar:', error);
    }
  }
}

module.exports = BLEManager;
```

#### 2.3 Crear Phonak Commands Handler

**Archivo:** `backend/src/bluetooth/phonak-commands.js`

```javascript
/**
 * Phonak Commands
 * Constructores de comandos BLE específicos para Phonak
 */

class PhonakCommands {
  
  /**
   * Construir comando de volumen
   * @param {number} volumePercent - 0-100
   * @returns {Buffer} Comando BLE
   */
  static buildVolumeCommand(volumePercent) {
    // Validar
    if (volumePercent < 0 || volumePercent > 100) {
      throw new Error('Volumen debe estar 0-100');
    }
    
    // Convertir a 0-255
    const volumeBLE = Math.round((volumePercent / 100) * 255);
    
    // Estructura: [opcode][volumen][validación][checksum]
    const opcode = 0x01;
    const validation = (~opcode) & 0xFF;
    
    // Checksum: XOR de todos excepto último, invertido
    const xor = opcode ^ volumeBLE ^ validation;
    const checksum = (~xor) & 0xFF;
    
    return Buffer.from([opcode, volumeBLE, validation, checksum]);
  }
  
  /**
   * Construir comando de programa
   * @param {number} programId - 0-11
   * @returns {Buffer} Comando BLE
   */
  static buildProgramCommand(programId) {
    // Validar
    if (programId < 0 || programId > 11) {
      throw new Error('Program ID debe estar 0-11');
    }
    
    const opcode = 0x02;
    const checksum = (~(opcode ^ programId)) & 0xFF;
    
    return Buffer.from([opcode, programId, checksum]);
  }
  
  /**
   * Construir comando de lectura de batería
   * @returns {Buffer} Comando BLE
   */
  static buildBatteryCommand() {
    return Buffer.from([0x03, 0x00, 0x00, 0xFC]);
  }
  
  /**
   * Parsear respuesta de batería
   * @param {Buffer} response - Respuesta del dispositivo
   * @returns {Object} Batería izq/der, estado carga
   */
  static parseBatteryResponse(response) {
    if (response.length < 4) {
      throw new Error('Respuesta de batería inválida');
    }
    
    return {
      opcode: response[0],
      batteryLeft: response[1],
      batteryRight: response[2],
      isCharging: response[3] === 0x01
    };
  }
  
  /**
   * Validar checksum
   * @param {Buffer} data - Datos con checksum
   * @returns {boolean} Es válido
   */
  static validateChecksum(data) {
    let xor = 0x00;
    for (const byte of data) {
      xor ^= byte;
    }
    return xor === 0x00;
  }
  
  /**
   * Mapeo de nombres de programa a ID
   */
  static getProgramId(programName) {
    const programs = {
      'automático': 0x00,
      'automatic': 0x00,
      'conversación': 0x01,
      'conversation': 0x01,
      'música': 0x02,
      'music': 0x02,
      'restaurante': 0x03,
      'restaurant': 0x03,
      'exterior': 0x04,
      'outdoor': 0x04,
      'teléfono': 0x05,
      'phone': 0x05,
      'cine': 0x06,
      'movie': 0x06,
      'silencio': 0x07,
      'quiet': 0x07,
      'custom1': 0x08,
      'custom2': 0x09,
      'custom3': 0x0A,
      'custom4': 0x0B
    };
    
    const id = programs[programName.toLowerCase()];
    
    if (id === undefined) {
      throw new Error(`Programa no reconocido: ${programName}`);
    }
    
    return id;
  }
}

module.exports = PhonakCommands;
```

---

### FASE 3: Integración con API (2-3 días)

#### 3.1 Crear rutas BLE en Express

**Archivo:** `backend/src/routes/ble-control.js`

```javascript
const express = require('express');
const router = express.Router();
const PhonakCommands = require('../bluetooth/phonak-commands');

// Middleware para inyectar BLE Manager
router.use((req, res, next) => {
  req.bleManager = req.app.locals.bleManager;
  next();
});

/**
 * GET /api/ble/scan
 * Escanear dispositivos Phonak
 */
router.get('/scan', async (req, res) => {
  try {
    const devices = await req.bleManager.scanForPhonakDevices(10000);
    
    res.json({
      success: true,
      devices: devices,
      count: devices.length,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ble/connect/:address
 * Conectar a dispositivo
 */
router.post('/connect/:address', async (req, res) => {
  try {
    const result = await req.bleManager.connect(req.params.address);
    
    // Notificar frontend
    req.app.locals.io?.emit('ble:connected', {
      address: req.params.address,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      device: result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ble/:address/volume
 * Cambiar volumen
 */
router.post('/:address/volume', async (req, res) => {
  try {
    const { volume } = req.body;
    
    if (typeof volume !== 'number' || volume < 0 || volume > 100) {
      return res.status(400).json({
        error: 'Volumen debe estar 0-100'
      });
    }
    
    // Construir comando
    const command = PhonakCommands.buildVolumeCommand(volume);
    
    // Enviar
    const result = await req.bleManager.writeCharacteristic(
      req.params.address,
      '0000110B-0000-1000-8000-00805F9B34FB', // Audio Control Service
      'XXXX',  // Reemplazar con UUID real de característica
      command
    );
    
    // Notificar
    req.app.locals.io?.emit('ble:volume-changed', {
      address: req.params.address,
      volume: volume,
      command: command.toString('hex')
    });
    
    res.json({
      success: true,
      device: req.params.address,
      volume: volume,
      command: command.toString('hex'),
      timestamp: new Date()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ble/:address/program
 * Cambiar programa
 */
router.post('/:address/program', async (req, res) => {
  try {
    const { program } = req.body;
    
    const programId = PhonakCommands.getProgramId(program);
    const command = PhonakCommands.buildProgramCommand(programId);
    
    // Enviar
    const result = await req.bleManager.writeCharacteristic(
      req.params.address,
      '0000110B-0000-1000-8000-00805F9B34FB',
      'XXXX',  // UUID real
      command
    );
    
    req.app.locals.io?.emit('ble:program-changed', {
      address: req.params.address,
      program: program,
      programId: programId
    });
    
    res.json({
      success: true,
      device: req.params.address,
      program: program,
      command: command.toString('hex'),
      timestamp: new Date()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ble/:address/battery
 * Leer batería
 */
router.get('/:address/battery', async (req, res) => {
  try {
    const command = PhonakCommands.buildBatteryCommand();
    
    // Enviar comando
    await req.bleManager.writeCharacteristic(
      req.params.address,
      '0000180F-0000-1000-8000-00805F9B34FB', // Battery Service
      '00002A19-0000-1000-8000-00805F9B34FB', // Battery Level
      command
    );
    
    // Leer respuesta (con timeout)
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout leyendo batería'));
      }, 1000);
      
      // Aquí iría lectura real de notificación
      // Por ahora simulado
      clearTimeout(timeout);
      resolve(Buffer.from([0x03, 75, 72, 0x00]));
    });
    
    const battery = PhonakCommands.parseBatteryResponse(response);
    
    req.app.locals.io?.emit('ble:battery-updated', {
      address: req.params.address,
      ...battery
    });
    
    res.json({
      success: true,
      device: req.params.address,
      ...battery,
      timestamp: new Date()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ble/:address/disconnect
 * Desconectar
 */
router.post('/:address/disconnect', async (req, res) => {
  try {
    await req.bleManager.disconnect(req.params.address);
    
    req.app.locals.io?.emit('ble:disconnected', {
      address: req.params.address
    });
    
    res.json({
      success: true,
      device: req.params.address,
      connected: false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

---

### FASE 4: Integración Frontend (2-3 días)

#### 4.1 Hook React para BLE

**Archivo:** `desktop/src/hooks/useBLEDevice.js`

```javascript
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

export const useBLEDevice = (deviceAddress) => {
  const socket = useSocket();
  
  const [state, setState] = useState({
    connected: false,
    volume: 0,
    program: 'automatic',
    batteryLeft: 0,
    batteryRight: 0,
    isCharging: false,
    error: null,
    loading: false
  });
  
  // Conectar a dispositivo
  const connect = useCallback(async () => {
    if (!deviceAddress) return;
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`/api/ble/connect/${deviceAddress}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Error conectando');
      
      setState(prev => ({ ...prev, connected: true, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error.message,
        loading: false 
      }));
    }
  }, [deviceAddress]);
  
  // Cambiar volumen
  const setVolume = useCallback(async (volume) => {
    if (!state.connected) return;
    
    try {
      const response = await fetch(`/api/ble/${deviceAddress}/volume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume })
      });
      
      if (!response.ok) throw new Error('Error cambiando volumen');
      
      setState(prev => ({ ...prev, volume }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [state.connected, deviceAddress]);
  
  // Cambiar programa
  const setProgram = useCallback(async (program) => {
    if (!state.connected) return;
    
    try {
      const response = await fetch(`/api/ble/${deviceAddress}/program`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ program })
      });
      
      if (!response.ok) throw new Error('Error cambiando programa');
      
      setState(prev => ({ ...prev, program }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [state.connected, deviceAddress]);
  
  // Leer batería
  const readBattery = useCallback(async () => {
    if (!state.connected) return;
    
    try {
      const response = await fetch(`/api/ble/${deviceAddress}/battery`);
      
      if (!response.ok) throw new Error('Error leyendo batería');
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        batteryLeft: data.batteryLeft,
        batteryRight: data.batteryRight,
        isCharging: data.isCharging
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [state.connected, deviceAddress]);
  
  // Escuchar WebSocket eventos
  useEffect(() => {
    if (!socket) return;
    
    socket.on('ble:volume-changed', (data) => {
      if (data.address === deviceAddress) {
        setState(prev => ({ ...prev, volume: data.volume }));
      }
    });
    
    socket.on('ble:program-changed', (data) => {
      if (data.address === deviceAddress) {
        setState(prev => ({ ...prev, program: data.program }));
      }
    });
    
    socket.on('ble:battery-updated', (data) => {
      if (data.address === deviceAddress) {
        setState(prev => ({
          ...prev,
          batteryLeft: data.batteryLeft,
          batteryRight: data.batteryRight,
          isCharging: data.isCharging
        }));
      }
    });
    
    return () => {
      socket.off('ble:volume-changed');
      socket.off('ble:program-changed');
      socket.off('ble:battery-updated');
    };
  }, [socket, deviceAddress]);
  
  // Auto-read batería cada 5 segundos
  useEffect(() => {
    if (!state.connected) return;
    
    const interval = setInterval(readBattery, 5000);
    return () => clearInterval(interval);
  }, [state.connected, readBattery]);
  
  return {
    ...state,
    connect,
    setVolume,
    setProgram,
    readBattery
  };
};
```

#### 4.2 Actualizar componente RealtimeMonitor

```javascript
// desktop/src/components/RealtimeMonitor.jsx - modificado

import { useBLEDevice } from '../hooks/useBLEDevice';

export const RealtimeMonitor = ({ deviceAddress }) => {
  const ble = useBLEDevice(deviceAddress);
  
  return (
    <div className="realtime-monitor">
      {/* Conexión */}
      <div className="connection-status">
        <button onClick={ble.connect} disabled={ble.connected}>
          {ble.connected ? '✓ Conectado' : 'Conectar'}
        </button>
        {ble.error && <span className="error">{ble.error}</span>}
      </div>
      
      {/* Volumen */}
      <div className="volume-control">
        <label>Volumen</label>
        <input 
          type="range"
          min="0"
          max="100"
          value={ble.volume}
          onChange={(e) => ble.setVolume(parseInt(e.target.value))}
          disabled={!ble.connected}
        />
        <span>{ble.volume}%</span>
      </div>
      
      {/* Programa */}
      <div className="program-control">
        <label>Programa</label>
        <select 
          value={ble.program}
          onChange={(e) => ble.setProgram(e.target.value)}
          disabled={!ble.connected}
        >
          <option value="automatic">Automático</option>
          <option value="conversation">Conversación</option>
          <option value="music">Música</option>
          <option value="restaurant">Restaurante</option>
          <option value="outdoor">Exterior</option>
        </select>
      </div>
      
      {/* Batería */}
      <div className="battery-display">
        <div>Izquierda: {ble.batteryLeft}%</div>
        <div>Derecha: {ble.batteryRight}%</div>
        {ble.isCharging && <div>⚡ Cargando</div>}
      </div>
    </div>
  );
};
```

---

### FASE 5: Testing (3-5 días)

#### 5.1 Test Unitarios

```bash
# Tests para checksum
npm test -- checksum.test.js

# Tests para comandos
npm test -- phonak-commands.test.js

# Tests para BLE Manager
npm test -- ble-manager.test.js
```

#### 5.2 Test de Integración

```bash
# 1. Iniciar servidor
npm run dev

# 2. En otra terminal, conectar audífonos
# 3. Ejecutar test
npm test -- integration.test.js

# 4. Validar:
# - Conexión exitosa
# - Cambios de volumen reflejados
# - Programas cambian correctamente
# - Batería se lee apropiadamente
```

#### 5.3 Test Manual

```
1. Abrir NoahLink Pro
2. Hacer clic en "Scan for Devices"
3. Seleccionar audífono Phonak
4. Conectar
5. Cambiar volumen en app → verificar audífono
6. Cambiar volumen en audífono físico → verificar app actualiza
7. Cambiar programa
8. Ver batería
9. Desconectar
10. Reconectar
```

---

## 📦 Estructura de Carpetas Final

```
noahlink-pro/
├── backend/
│   ├── src/
│   │   ├── bluetooth/
│   │   │   ├── ble-manager.js        (NEW)
│   │   │   ├── phonak-commands.js    (NEW)
│   │   │   └── ble-controller.js     (EXISTING)
│   │   ├── routes/
│   │   │   ├── ble-control.js        (NEW)
│   │   │   └── [otras rutas]
│   │   └── index.js                  (MODIFICAR)
│   └── package.json
├── tools/
│   └── analyze_wireshark_capture.py  (NEW)
├── docs/
│   └── BLE_REVERSE_ENGINEERING_RESULTS.md (NEW)
├── captures/
│   ├── phonak_volume_capture.pcapng  (NEW)
│   ├── phonak_program_capture.pcapng (NEW)
│   └── phonak_battery_capture.pcapng (NEW)
└── PHONAK_BLE_*.md                   (NEW)
```

---

## 🎯 Checklist de Implementación

### FASE 1: Investigación
- [ ] Instalar Wireshark + Npcap
- [ ] Capturar tráfico BLE de cambio volumen
- [ ] Capturar tráfico BLE de cambio programa
- [ ] Capturar tráfico BLE de batería
- [ ] Analizar con Python script
- [ ] Documentar estructura de comandos
- [ ] Validar checksum con múltiples ejemplos

### FASE 2: Librería BLE
- [ ] Instalar @noble/bluetooth
- [ ] Crear BLEManager.js
- [ ] Implementar escaneo de dispositivos
- [ ] Implementar conexión
- [ ] Crear PhonakCommands.js
- [ ] Implementar constructores de comandos
- [ ] Test unitario de checksum

### FASE 3: API REST
- [ ] Crear rutas BLE en Express
- [ ] Implementar /api/ble/scan
- [ ] Implementar /api/ble/connect
- [ ] Implementar /api/ble/:address/volume
- [ ] Implementar /api/ble/:address/program
- [ ] Implementar /api/ble/:address/battery
- [ ] WebSocket integration

### FASE 4: Frontend
- [ ] Crear hook useBLEDevice
- [ ] Actualizar componentes
- [ ] Agregar UI para escaneo
- [ ] Agregar UI para volumen/programa
- [ ] Agregar UI para batería
- [ ] Testing manual

### FASE 5: Testing
- [ ] Unit tests (checksum, comandos)
- [ ] Integration tests
- [ ] Manual testing con audífonos reales
- [ ] Bug fixes
- [ ] Documentación final

---

## ⏱️ Estimación de Tiempo Total

| Fase | Días | Horas |
|------|------|-------|
| Investigación | 3-5 | 24-40 |
| Librería BLE | 3-5 | 24-40 |
| API REST | 2-3 | 16-24 |
| Frontend | 2-3 | 16-24 |
| Testing | 3-5 | 24-40 |
| **TOTAL** | **13-21** | **104-168** |

**Estimación realista: 2-3 semanas de trabajo full-time**

---

## 🚨 Riesgos Potenciales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Estructura comando diferente | Media | Alto | Capturar múltiples modelos |
| Falta soporte BLE en algunos modelos | Media | Medio | Documentar modelos compatibles |
| Estabilidad conexión | Alta | Medio | Implementar reconnect automático |
| Compatibilidad Windows/Mac | Media | Bajo | Testear en ambas plataformas |
| Latencia en control | Baja | Bajo | Optimizar timings |

---

## 📞 Soporte Técnico

**Si necesitas ayuda:**
1. Revisar documentos: `PHONAK_BLE_PROTOCOL_ANALYSIS.md`
2. Revisar tablas: `PHONAK_QUICK_REFERENCE.md`
3. Revisar guía Wireshark: `WIRESHARK_BLE_CAPTURE_GUIDE.md`
4. Contactar a Phonak si tienes SDK disponible
5. Usar nRF Connect Desktop para debug

---

**Plan de Implementación - NoahLink Pro**
*Versión 1.0 | 2026-10-05*
*Fase integral de Bluetooth real*
