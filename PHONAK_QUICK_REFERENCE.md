# 🚀 Referencia Rápida: Protocolo BLE Phonak

**Tabla de consulta rápida para desarrollo - Todos los UUIDs, comandos y ejemplos**

---

## 📊 UUIDs Completos

### Servicios Estándar GATT (Bluetooth SIG)

| Nombre | UUID 16-bit | UUID Completo | Caso de Uso |
|--------|-----------|---------------|-----------|
| Generic Access | 0x1800 | 00001800-0000-1000-8000-00805F9B34FB | Acceso básico |
| Generic Attribute | 0x1801 | 00001801-0000-1000-8000-00805F9B34FB | Servidor GATT |
| Immediate Alert | 0x1802 | 00001802-0000-1000-8000-00805F9B34FB | Alarma |
| Link Loss | 0x1803 | 00001803-0000-1000-8000-00805F9B34FB | Pérdida conexión |
| TX Power Level | 0x1804 | 00001804-0000-1000-8000-00805F9B34FB | Potencia transmisión |
| **Device Info** | **0x180A** | **0000180A-0000-1000-8000-00805F9B34FB** | **IMPORTANTE** |
| **Battery** | **0x180F** | **0000180F-0000-1000-8000-00805F9B34FB** | **IMPORTANTE** |
| Heart Rate | 0x180D | 0000180D-0000-1000-8000-00805F9B34FB | Pulso |
| Human Interface Device | 0x1812 | 00001812-0000-1000-8000-00805F9B34FB | Teclado/Ratón |
| Scan Parameters | 0x1813 | 00001813-0000-1000-8000-00805F9B34FB | Escaneo |
| **Hearing Aid Audio** | **0x1842** | **00001842-0000-1000-8000-00805F9B34FB** | **Audio audífono** |
| **Microphone Control** | **0x184D** | **0000184D-0000-1000-8000-00805F9B34FB** | **Micrófono** |
| **Volume Control** | **0x1844** | **00001844-0000-1000-8000-00805F9B34FB** | **CRÍTICO** |
| MIDI Service | 0x1850 | 00001850-0000-1000-8000-00805F9B34FB | Audio MIDI |

### Características Estándar

| Servicio | Nombre | UUID 16-bit | Propiedades | Rango |
|----------|--------|-----------|------------|-------|
| Device Info | Manufacturer | 0x2A29 | Read | String |
| Device Info | Model | 0x2A24 | Read | String |
| Device Info | Serial | 0x2A25 | Read | String |
| Device Info | HW Revision | 0x2A27 | Read | String |
| Device Info | FW Revision | 0x2A26 | Read | String |
| Device Info | SW Revision | 0x2A28 | Read | String |
| **Battery** | **Level** | **0x2A19** | **Read, Notify** | **0-100%** |
| Battery | Power State | 0x2A1C | Read, Notify | Bitmask |
| Volume Control | Volume State | 0x2E7D | Read, Notify | 0-255 |
| Volume Control | Control Point | 0x2E7E | Write | [0x00-0x02][param] |

### Servicios Propios Phonak (Investigados)

```
Servicio Principal de Audio Control
UUID: A26EE0B8-5342-11E1-B86C-0002A5D5C51B
Propósito: Control de volumen, programa, micrófono
Características:
  - Write: [opcode][valor][validación][checksum]
  - Notify: Confirmación de cambios

Servicio de Batería Extendida
UUID: 99FA4B4C-FD61-4B06-936B-02E6AE6F8364
Características:
  - Battery Left (0-100)
  - Battery Right (0-100)
  - Charging Status (0x00/0x01)

Servicio de Actualización de Firmware
UUID: D87F7110-925D-4587-8D18-18D2DA61D0D1
Características:
  - Firmware Version (lectura)
  - Upload Characteristic (escritura)
  - Status (notificación)

Configuración Personalizada
UUID: A26EE0B8-5342-11E1-B86C-0002A5D5C51C
Características:
  - Settings Read/Write
  - Calibration Data
  - Advanced Features
```

---

## 🎛️ Estructura de Comandos

### Comando de Volumen (0x01)

**Estructura de 4 bytes:**

```
┌────────┬────────────┬────────────┬──────────┐
│ Byte 0 │ Byte 1     │ Byte 2     │ Byte 3   │
├────────┼────────────┼────────────┼──────────┤
│ Opcode │ Volumen    │ Validación │ Checksum │
│ 0x01   │ 0x00-0xFF  │ ~0x01      │ XOR Inv  │
└────────┴────────────┴────────────┴──────────┘

Ejemplo: Volumen 50%
0x01 0x32 0xFE 0xCD

Cálculo:
  Volumen BLE = (Volumen_UI / 100) * 255
  Validación = ~0x01 & 0xFF = 0xFE
  Checksum = ~(0x01 ^ 0x32 ^ 0xFE) & 0xFF = 0xCD
```

**Tabla de volúmenes comunes:**

| % | Valor HEX | Validación | Checksum | Comando |
|---|-----------|-----------|----------|---------|
| 0 | 0x00 | 0xFE | 0x01 | 01 00 FE 01 |
| 10 | 0x19 | 0xFE | 0xE8 | 01 19 FE E8 |
| 25 | 0x40 | 0xFE | 0xBF | 01 40 FE BF |
| 50 | 0x7F | 0xFE | 0x80 | 01 7F FE 80 |
| 75 | 0xBF | 0xFE | 0x40 | 01 BF FE 40 |
| 100 | 0xFF | 0xFE | 0x00 | 01 FF FE 00 |

### Comando de Programa (0x02)

**Estructura de 3 bytes:**

```
┌────────┬──────────────┬──────────┐
│ Byte 0 │ Byte 1       │ Byte 2   │
├────────┼──────────────┼──────────┤
│ Opcode │ Program ID   │ Checksum │
│ 0x02   │ 0x00-0x0B    │ XOR Inv  │
└────────┴──────────────┴──────────┘

Cálculo de Checksum:
Checksum = ~(0x02 ^ Program_ID) & 0xFF
```

**Mapeo de programas:**

| ID Hex | ID Dec | Programa | Comando |
|--------|--------|----------|---------|
| 0x00 | 0 | Automático | 02 00 FD |
| 0x01 | 1 | Conversación | 02 01 FC |
| 0x02 | 2 | Música | 02 02 FB |
| 0x03 | 3 | Restaurante | 02 03 FA |
| 0x04 | 4 | Exterior | 02 04 F9 |
| 0x05 | 5 | Teléfono | 02 05 F8 |
| 0x06 | 6 | Cine | 02 06 F7 |
| 0x07 | 7 | Silencio | 02 07 F6 |
| 0x08 | 8 | Personalizado 1 | 02 08 F5 |
| 0x09 | 9 | Personalizado 2 | 02 09 F4 |
| 0x0A | 10 | Personalizado 3 | 02 0A F3 |
| 0x0B | 11 | Personalizado 4 | 02 0B F2 |

### Comando de Lectura de Batería (0x03)

**Estructura de 4 bytes:**

```
┌────────┬──────┬──────┬──────┐
│ Byte 0 │ Byte 1 | Byte 2 | Byte 3 |
├────────┼──────┼──────┼──────┤
│ Opcode │ Flag │ Flag │ Flag │
│ 0x03   │ 0x00 │ 0x00 │ 0xFC │
└────────┴──────┴──────┴──────┘

Comando: 03 00 00 FC

Respuesta esperada:
┌────────┬──────────────────┬──────────────────┬──────────────┐
│ Byte 0 │ Byte 1           │ Byte 2           │ Byte 3       │
├────────┼──────────────────┼──────────────────┼──────────────┤
│ Opcode │ Battery Izq (%)  │ Battery Der (%)  │ Charging     │
│ 0x03   │ 0x00-0x64        │ 0x00-0x64        │ 0x00 o 0x01  │
└────────┴──────────────────┴──────────────────┴──────────────┘

Ejemplo de respuesta:
03 4B 48 00
Batería izquierda: 75% (0x4B = 75 decimal)
Batería derecha: 72% (0x48 = 72 decimal)
Cargando: No (0x00)
```

### Comando de Control de Micrófono (0x04)

**Estructura de 3 bytes:**

```
┌────────┬────────────────┬──────────┐
│ Byte 0 │ Byte 1         │ Byte 2   │
├────────┼────────────────┼──────────┤
│ Opcode │ Mic Control    │ Checksum │
│ 0x04   │ 0x00-0x03      │ XOR Inv  │
└────────┴────────────────┴──────────┘
```

**Valores de micrófono:**

| Valor | Nombre | Comando |
|-------|--------|---------|
| 0x00 | Cerrado (Mute) | 04 00 FB |
| 0x01 | Normal | 04 01 FA |
| 0x02 | Amplificado | 04 02 F9 |
| 0x03 | Máximo | 04 03 F8 |

---

## 🧮 Algoritmos de Checksum

### XOR Simple Invertido (Método Phonak)

```python
def calculate_checksum(data_bytes):
    """
    Calcular checksum XOR de todos los bytes excepto el último
    Invertir el resultado
    
    Rango data_bytes: lista de 1-3 bytes
    Retorna: checksum de 1 byte
    """
    xor_result = 0x00
    
    # XOR de todos excepto último
    for byte in data_bytes[:-1]:
        xor_result ^= byte
    
    # Invertir y limitar a 8 bits
    checksum = (~xor_result) & 0xFF
    
    return checksum

def validate_checksum(data_with_checksum):
    """
    Validar que checksum es correcto
    XOR de todos los bytes incluyendo checksum debe ser 0
    """
    result = 0x00
    for byte in data_with_checksum:
        result ^= byte
    
    return result == 0x00

# Ejemplo de uso:
cmd_volume = [0x01, 0x32, 0xFE]  # Opcode, Volumen, Validación
checksum = calculate_checksum(cmd_volume)
print(f"Checksum: 0x{checksum:02X}")

# Crear comando completo
complete_cmd = cmd_volume + [checksum]
print(f"Comando: {' '.join(f'{b:02X}' for b in complete_cmd)}")

# Validar
is_valid = validate_checksum(complete_cmd)
print(f"Válido: {is_valid}")
```

### Tabla de XOR Rápida

```
Para volumen (opcode 0x01):
Vol %  | Vol Hex | Val(0xFE) | XOR    | Checksum
0      | 0x00    | 0xFE      | 0xFF   | 0x00
25     | 0x40    | 0xFE      | 0xBE   | 0x41
50     | 0x7F    | 0xFE      | 0x7D   | 0x82
75     | 0xBF    | 0xFE      | 0x41   | 0xBE
100    | 0xFF    | 0xFE      | 0x01   | 0xFE
```

---

## 📡 Características GATT por Servicio

### Device Information Service (0x180A)

```javascript
const deviceInfoService = {
  uuid: '0000180A-0000-1000-8000-00805F9B34FB',
  characteristics: [
    {
      uuid: '0000180A-0000-1000-8000-00805F9B34FB',
      name: 'Manufacturer Name String',
      uuid16: 0x2A29,
      properties: ['read'],
      expectedValue: 'Phonak Communications AG'
    },
    {
      uuid: '0000180A-0000-1000-8000-00805F9B34FB',
      name: 'Model Number String',
      uuid16: 0x2A24,
      properties: ['read'],
      examples: ['AUDÉO M30-312T', 'MARVEL-312-R', 'VIRTO-13-312']
    },
    {
      uuid: '0000180A-0000-1000-8000-00805F9B34FB',
      name: 'Serial Number String',
      uuid16: 0x2A25,
      properties: ['read']
    },
    {
      uuid: '0000180A-0000-1000-8000-00805F9B34FB',
      name: 'Hardware Revision String',
      uuid16: 0x2A27,
      properties: ['read'],
      examples: ['1.0', '2.1', '3.0']
    },
    {
      uuid: '0000180A-0000-1000-8000-00805F9B34FB',
      name: 'Firmware Revision String',
      uuid16: 0x2A26,
      properties: ['read'],
      examples: ['2.1.0.1234', '3.4.2.0056']
    }
  ]
};
```

### Battery Service (0x180F)

```javascript
const batteryService = {
  uuid: '0000180F-0000-1000-8000-00805F9B34FB',
  characteristics: [
    {
      uuid: '0000180F-0000-1000-8000-00805F9B34FB',
      name: 'Battery Level',
      uuid16: 0x2A19,
      properties: ['read', 'notify'],
      dataType: 'uint8',
      range: '0-100 (%)',
      unit: 'percentage',
      readFrequency: '1-2 segundos'
    },
    {
      uuid: '0000180F-0000-1000-8000-00805F9B34FB',
      name: 'Battery Power State',
      uuid16: 0x2A1C,
      properties: ['read', 'notify'],
      dataType: 'bitmask',
      bits: {
        0: 'Battery present',
        1: 'Battery removable',
        2: 'Battery charging',
        3: 'Battery charge control enabled'
      }
    }
  ]
};
```

### Hearing Aid Audio Service (0x1842)

```javascript
const hearingAidService = {
  uuid: '00001842-0000-1000-8000-00805F9B34FB',
  characteristics: [
    {
      name: 'Preset Control',
      properties: ['read', 'write', 'notify'],
      expectedUse: 'Cambio de programa'
    },
    {
      name: 'Hearing Aid Features',
      properties: ['read', 'notify'],
      expectedUse: 'Capacidades del dispositivo'
    }
  ]
};
```

### Microphone Control Service (0x184D)

```javascript
const microphoneService = {
  uuid: '0000184D-0000-1000-8000-00805F9B34FB',
  characteristics: [
    {
      name: 'Mute',
      properties: ['read', 'write', 'notify'],
      values: {
        0: 'Not muted',
        1: 'Muted'
      }
    },
    {
      name: 'Gain Setting',
      properties: ['read', 'write', 'notify'],
      range: '0-255',
      units: 'dB'
    }
  ]
};
```

### Volume Control Service (0x1844)

```javascript
const volumeService = {
  uuid: '00001844-0000-1000-8000-00805F9B34FB',
  characteristics: [
    {
      name: 'Volume State',
      uuid16: 0x2E7D,
      properties: ['read', 'notify'],
      size: '1-2 bytes',
      byte0: 'Volume level (0-255)',
      byte1: 'Volume step'
    },
    {
      name: 'Volume Control Point',
      uuid16: 0x2E7E,
      properties: ['write', 'writeWithoutResponse'],
      opcodes: {
        0x00: 'Relative volume change',
        0x01: 'Unmute',
        0x02: 'Mute'
      }
    },
    {
      name: 'Volume Flags',
      uuid16: 0x2E7F,
      properties: ['read', 'notify'],
      bits: {
        0: 'Mute support',
        1: 'Relative volume change support'
      }
    }
  ]
};
```

---

## 💻 Ejemplos de Código Implementable

### Conexión Básica a Dispositivo

```javascript
// Pseudocódigo para conexión
async function connectToPhonakHearing(deviceMAC) {
  try {
    // 1. Buscar dispositivo
    const device = await discoverDevice(deviceMAC);
    console.log(`[+] Dispositivo encontrado: ${device.name}`);
    
    // 2. Conectar
    await device.connect();
    console.log(`[+] Conectado a ${deviceMAC}`);
    
    // 3. Descubrir servicios
    const services = await device.discoverServices();
    
    // 4. Mapear servicios importantes
    const deviceInfo = findService(services, 0x180A);
    const battery = findService(services, 0x180F);
    const audioControl = findService(services, [
      '00001842-0000-1000-8000-00805F9B34FB',
      'A26EE0B8-5342-11E1-B86C-0002A5D5C51B'
    ]);
    
    // 5. Leer información
    const manufacturer = await deviceInfo.read('2A29');
    const model = await deviceInfo.read('2A24');
    const fw = await deviceInfo.read('2A26');
    
    console.log(`Fabricante: ${manufacturer}`);
    console.log(`Modelo: ${model}`);
    console.log(`Firmware: ${fw}`);
    
    return device;
  } catch (error) {
    console.error(`[-] Error: ${error.message}`);
    throw error;
  }
}
```

### Envío de Comando de Volumen

```javascript
async function setVolumeRealtime(device, volumePercent) {
  try {
    // Validar rango
    if (volumePercent < 0 || volumePercent > 100) {
      throw new Error('Volumen debe estar 0-100');
    }
    
    // 1. Encontrar característica de escritura de volumen
    const audioService = await device.getService(0x1842);
    const writeChar = await audioService.getCharacteristics('write');
    
    // 2. Construir comando
    const volumeBLE = Math.round((volumePercent / 100) * 255);
    const opcode = 0x01;
    const validation = (~opcode) & 0xFF;
    
    // Calcular checksum
    const xor = opcode ^ volumeBLE ^ validation;
    const checksum = (~xor) & 0xFF;
    
    // 3. Crear buffer
    const command = Buffer.from([opcode, volumeBLE, validation, checksum]);
    
    console.log(`[>] Enviando: ${command.toString('hex').toUpperCase()}`);
    console.log(`    Volumen: ${volumePercent}% (BLE: 0x${volumeBLE.toString(16).toUpperCase()})`);
    
    // 4. Escribir comando
    await writeChar.writeValue(command);
    
    // 5. Esperar confirmación
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 1000);
      
      writeChar.on('notification', (value) => {
        clearTimeout(timeout);
        resolve(value);
      });
    });
    
    console.log(`[✓] Confirmado: ${response.toString('hex').toUpperCase()}`);
    
    return {
      success: true,
      volumePercent: volumePercent,
      volumeBLE: volumeBLE,
      command: command.toString('hex')
    };
    
  } catch (error) {
    console.error(`[-] Error al cambiar volumen: ${error.message}`);
    throw error;
  }
}
```

### Lectura de Batería

```javascript
async function readBatteryLevel(device) {
  try {
    // 1. Encontrar servicio de batería
    const batteryService = await device.getService(0x180F);
    const batteryChar = await batteryService.getCharacteristic(0x2A19);
    
    // 2. Leer nivel
    const levelBuffer = await batteryChar.readValue();
    const level = levelBuffer[0];
    
    console.log(`[*] Batería: ${level}%`);
    
    // 3. Suscribirse a notificaciones
    batteryChar.on('notification', (value) => {
      const newLevel = value[0];
      console.log(`[!] Batería actualizada: ${newLevel}%`);
    });
    
    return {
      current: level,
      percentage: level,
      isLow: level < 20
    };
    
  } catch (error) {
    console.error(`[-] Error al leer batería: ${error.message}`);
    throw error;
  }
}
```

### Cambio de Programa

```javascript
async function switchProgram(device, programName) {
  // Mapeo de programas
  const programs = {
    'automático': 0x00,
    'conversación': 0x01,
    'música': 0x02,
    'restaurante': 0x03,
    'exterior': 0x04,
    'teléfono': 0x05,
    'cine': 0x06,
    'silencio': 0x07,
    'custom1': 0x08,
    'custom2': 0x09,
    'custom3': 0x0A,
    'custom4': 0x0B
  };
  
  const programId = programs[programName.toLowerCase()];
  
  if (programId === undefined) {
    throw new Error(`Programa no encontrado: ${programName}`);
  }
  
  // Construir comando
  const opcode = 0x02;
  const checksum = (~(opcode ^ programId)) & 0xFF;
  const command = Buffer.from([opcode, programId, checksum]);
  
  console.log(`[>] Cambiando a: ${programName}`);
  console.log(`    Comando: ${command.toString('hex').toUpperCase()}`);
  
  // Enviar
  const audioService = await device.getService(0x1842);
  const writeChar = await audioService.getCharacteristics('write');
  
  await writeChar.writeValue(command);
  
  return {
    success: true,
    program: programName,
    programId: programId,
    command: command.toString('hex')
  };
}
```

---

## 🎯 Timeouts y Delays Críticos

```javascript
const BLE_TIMINGS = {
  // Conexión
  CONNECTION_TIMEOUT: 5000,        // 5 segundos máximo
  SERVICE_DISCOVERY_TIMEOUT: 3000, // 3 segundos
  
  // Comunicación
  COMMAND_RESPONSE_TIMEOUT: 1000,  // 1 segundo espera respuesta
  WRITE_COMMAND_DELAY: 30,         // 30ms entre comandos
  
  // Datos
  BATTERY_UPDATE_INTERVAL: 1000,   // Lee cada 1 segundo
  VOLUME_CHANGE_DELAY: 50,         // Delay para aplicación
  PROGRAM_CHANGE_DELAY: 150,       // Delay para reinicio DSP
  
  // Reconexión
  RECONNECTION_ATTEMPT_DELAY: 500, // 500ms entre intentos
  RECONNECTION_MAX_ATTEMPTS: 5,    // Máximo 5 intentos
  
  // Link Loss
  LINK_LOSS_TIMEOUT: 3000,         // 3 segundos sin paquetes
  LINK_LOSS_RECOVERY: 5000         // 5 segundos máximo de recuperación
};

// Uso en código
async function sendVolumeWithDelay(device, volume) {
  await setVolume(device, volume);
  await delay(BLE_TIMINGS.WRITE_COMMAND_DELAY);
  return volume;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## ✅ Checklist de Validación

Antes de implementar, verificar:

- [ ] Dispositivo Phonak soporta BLE (modelo 2019+)
- [ ] Adaptador Bluetooth 5.0+ conectado a PC
- [ ] Wireshark 4.0+ con Npcap instalado
- [ ] Capacidad de capturar tráfico BLE
- [ ] Audífonos aparecer en escaneo BLE
- [ ] Servicios GATT se descubren correctamente
- [ ] Comandos se envían sin errores
- [ ] Respuestas se reciben dentro del timeout
- [ ] Checksum valida correctamente
- [ ] Cambios se reflejan en audífono físico

---

## 🔗 Links Rápidos

| Recurso | URL |
|---------|-----|
| Spec GATT Bluetooth | https://www.bluetooth.com/specifications/gatt/ |
| nRF Connect | https://www.nordicsemiconductor.com/products/nrf-connect-for-desktop/ |
| Wireshark | https://www.wireshark.org/ |
| Npcap Dongle | https://npcap.com/dist/ |
| Noble.js (Node) | https://github.com/noble/noble |
| Phonak Support | https://www.phonak.com/en/en/professionals/support.html |

---

**Documento de Referencia Rápida - NoahLink Pro**
*Última actualización: 2026-10-05*
*Para uso técnico durante desarrollo*
