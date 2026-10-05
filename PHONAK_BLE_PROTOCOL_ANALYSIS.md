# 🔬 Análisis de Protocolo BLE Phonak

**Estatus**: En investigación (Fase 1)  
**Última actualización**: 2026-10-05  
**Objetivo**: Mapear protocolo BLE específico de audífonos Phonak para implementar control real

---

## 1. 🎯 Objetivos de Análisis

### Preguntas Clave a Responder:

1. **¿Qué servicios GATT utiliza Phonak?**
   - UUIDs de servicios (Service UUIDs)
   - Servicios estándar vs. propietarios

2. **¿Cómo se controla el volumen?**
   - ¿Rango de valores? (0-100, 0-127, 0-255)
   - ¿Tipo de dato? (byte, int, array)
   - ¿Escritura directa o comando especial?

3. **¿Cómo se cambian los programas?**
   - ¿Índice o UUID?
   - ¿Validación de cambio?
   - ¿Confirmación necesaria?

4. **¿Cómo se lee la batería?**
   - ¿Notificación o lectura?
   - ¿Rango de valores?
   - ¿Frecuencia de actualización?

5. **¿Hay autenticación?**
   - ¿PIN o pairing específico?
   - ¿Seguridad requerida?

---

## 2. 📋 UUIDs Estándar Bluetooth (Baseline)

### Servicios GATT Comunes:

| UUID | Nombre | Propósito |
|------|--------|-----------|
| `0000180A-0000-1000-8000-00805f9b34fb` | Device Information Service | Datos del dispositivo |
| `0000180F-0000-1000-8000-00805f9b34fb` | Battery Service | Nivel de batería |
| `0000110B-0000-1000-8000-00805f9b34fb` | Audio Control Service | Control de audio |
| `0000110E-0000-1000-8000-00805f9b34fb` | HID over GATT | Control HID |
| `0000181D-0000-1000-8000-00805f9b34fb` | Hearing Aid Audio Service | Audio para audífonos 🎧 |

### Características GATT Comunes:

| UUID | Nombre | Propiedades | Valor Típico |
|------|--------|-------------|--------------|
| `00002A19-0000-1000-8000-00805f9b34fb` | Battery Level | read, notify | 0-100 |
| `00002A29-0000-1000-8000-00805f9b34fb` | Manufacturer Name | read | "Phonak" |
| `00002A24-0000-1000-8000-00805f9b34fb` | Model Number String | read | Modelo |
| `00002A25-0000-1000-8000-00805f9b34fb` | Serial Number String | read | Número serie |

---

## 3. 🔍 Estructura Típica de Comandos BLE

### Patrón General:

```
[Comando][Parámetro1][Parámetro2]...[Checksum?]
```

### Ejemplos Hipotéticos para Phonak:

#### Comando de Volumen:
```
Byte 0: 0x20           // Comando: SET_VOLUME
Byte 1: 0x32           // Valor: 50 (0-100) o (0-255)
Byte 2-3: [Checksum]   // Validación
```

#### Comando de Programa:
```
Byte 0: 0x30           // Comando: SET_PROGRAM
Byte 1: 0x02           // Índice de programa (0-5)
Byte 2-3: [Checksum]   // Validación
```

---

## 4. 🛠️ Herramientas para Análisis

### Herramienta 1: Wireshark + HCI Sniffer (RECOMENDADO)

```bash
# Windows - Capturar tráfico BLE
# Requiere: Bluetooth HCI Sniffer driver

# En Wireshark:
# 1. Iniciar captura en adaptador Bluetooth
# 2. Cambiar volumen en Phonak Target
# 3. Analizar paquetes GATT Write
# 4. Buscar características y valores escritos
```

### Herramienta 2: nRF Connect (Nordic Semiconductor)

**Descargar**: https://www.nordicsemi.com/Products/nRF-Connect-for-Desktop

**Pasos**:
1. Escanear dispositivos BLE
2. Conectar a audífono Phonak
3. Explorar servicios/características
4. Leer/escribir valores manualmente
5. Capturar valores en cada operación

### Herramienta 3: Reverse Engineering de Phonak Target

```bash
# Análisis estático:
# 1. Abrir Target.exe en IDA Pro / Ghidra
# 2. Buscar patrones de UUIDs (strings)
# 3. Buscar valores de volumen (0-100)

# Análisis dinámico:
# 1. Ejecutar con debugger (x64dbg)
# 2. Breakpoint en funciones Bluetooth
# 3. Inspeccionar buffers de datos
```

---

## 5. 🧪 Plan de Captura de Datos

### Paso 1: Preparación
```
1. Instalar Wireshark + BLE support
2. Emparejar audífono con computadora
3. Abrir Phonak Target
4. Iniciar captura en Wireshark
```

### Paso 2: Operaciones a Capturar
```
1. Conectar audífono en Target
   → Capturar: Handshake, notificaciones iniciales

2. Cambiar volumen (0% → 100% incrementos)
   → Capturar: GATT Write payloads
   → Analizar: Valores enviados vs. cambios en UI

3. Cambiar programa (Automático → Música → Restaurante)
   → Capturar: Comandos de programa
   → Analizar: Estructura de datos

4. Ver batería
   → Capturar: Lectura/notificación
   → Analizar: Actualización de valores

5. Desconectar
   → Capturar: Teardown, cleanup
```

### Paso 3: Documentación
```
Para cada operación capturada:
├─ UUID del servicio
├─ UUID de la característica
├─ Tipo de operación (read/write/notify)
├─ Payload exacto (en hex)
├─ Respuesta esperada
└─ Frecuencia de actualización
```

---

## 6. 📊 Matriz de Descubrimiento

| # | Tarea | Herramienta | Resultado |
|---|-------|-----------|----------|
| 1 | Conectar audífono | nRF Connect | MAC address, RSSI |
| 2 | Listar servicios | nRF Connect | Service UUIDs |
| 3 | Listar características | nRF Connect | Characteristic UUIDs + propiedades |
| 4 | Cambiar volumen (UI) | Wireshark | Payload exacto |
| 5 | Cambiar programa (UI) | Wireshark | Comando de programa |
| 6 | Leer batería | nRF Connect | Valor de batería |
| 7 | Mapear respuestas | Análisis manual | Tabla de comandos |

---

## 7. 📈 Timeline Esperado

```
Día 1-2: Instalación de herramientas + captura inicial
Día 2-3: Análisis de tráfico en Wireshark
Día 3-4: Mapeo de UUIDs y comandos
Día 4-5: Validación con nRF Connect (manual)
Día 5+: Documentación final + validación
```

---

## 8. 🔗 Próximos Pasos

### Para completar este análisis:

1. **Instalar Wireshark** con soporte BLE
2. **Descargar nRF Connect** para análisis manual
3. **Acceso a Phonak Target** (ya tienes)
4. **Audífono Phonak emparejado** (ya detectado)

**Acción inmediata**:
```
1. ✅ Instalar herramientas
2. ✅ Capturar tráfico BLE de volumen
3. ✅ Documentar payloads
4. ✅ Mapear UUIDs reales
5. ✅ Validar estructura de comandos
```

---

*Documento de análisis dinámico. Se actualiza conforme avanza la investigación.*
