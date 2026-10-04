# 🎧 Plan: Convertir NoahLink Pro de Demo a Real

## 📊 Estado Actual
- ✅ UI completamente funcional
- ✅ Backend con endpoints listos
- ❌ Sin conexión Bluetooth real
- ❌ Usando datos simulados

---

## 🎯 Objetivo
Implementar control **REAL** de audífonos Phonak vía:
- Bluetooth nativo
- NoahLink Wireless API
- Detección real de dispositivos

---

## 📋 Fases de Implementación

### **FASE 1: Detección de Dispositivos** (Semana 1)
**Objetivo:** Detectar audífonos Phonak reales conectados

#### 1.1 Backend - Bluetooth Detection
```javascript
// backend/src/bluetooth/real-detector.js
- Usar librería 'node-bluetooth' o 'noble'
- Buscar dispositivos Phonak por UUID
- Conectar a servicios BLE (Bluetooth Low Energy)
- Leer características del dispositivo
```

**Dependencias a instalar:**
```bash
npm install noble @noble/bluetooth
npm install phonak-api  # Opcional: si existe
```

#### 1.2 Reemplazar device-detector.js
```
Cambiar: backend/src/services/device-detector.js
De: Datos simulados (demoDevices array)
A: Real Bluetooth scan (noble.discover())
```

#### 1.3 Frontend - Real Devices
```javascript
// desktop/src/hooks/useDemoData.js → useRealDevices.js
- Eliminar globalDeviceState simulado
- Conectar a WebSocket real
- Recibir dispositivos del backend
- Auto-detectar cambios de estado
```

---

### **FASE 2: Control de Volumen** (Semana 2)
**Objetivo:** Cambiar volumen REAL en audífonos

#### 2.1 Backend - Volume Control
```javascript
// backend/src/bluetooth/commands.js
export async function setVolume(deviceId, volume) {
  // 1. Conectar a dispositivo
  // 2. Escribir comando BLE para volumen
  // 3. Confirmar cambio
  // 4. Notificar frontend vía WebSocket
}
```

#### 2.2 Frontend - Real Updates
```javascript
// desktop/src/components/RealtimeMonitor.jsx
const handleVolumeChange = async (newVolume) => {
  // Antes: setVolume(newVolume) [demo]
  // Ahora: await updateVolume(deviceId, newVolume) [real]
  const response = await fetch('/api/device/volume', {
    method: 'POST',
    body: JSON.stringify({ deviceId, volume: newVolume })
  });
}
```

#### 2.3 Endpoints a crear:
```
POST /api/device/:id/volume
- Body: { volume: 0-100 }
- Response: { success, deviceId, newVolume }
```

---

### **FASE 3: Cambio de Programas** (Semana 3)
**Objetivo:** Cambiar programas de audio reales

#### 3.1 Backend - Program Management
```javascript
// backend/src/bluetooth/programs.js
export async function switchProgram(deviceId, programName) {
  // 1. Validar programa disponible
  // 2. Escribir comando BLE
  // 3. Confirmar cambio
  // 4. Notificar frontend
}
```

#### 3.2 Endpoints:
```
POST /api/device/:id/program
- Body: { program: 'Conversation'|'Music'|etc }
```

#### 3.3 Programas disponibles (detectar automáticamente):
```javascript
- Automático
- Conversación
- Música
- Restaurante
- Exterior
- Silencio
```

---

### **FASE 4: Actualización de Firmware** (Semana 4)
**Objetivo:** Actualizar firmware REAL

#### 4.1 Backend - Firmware Update
```javascript
// backend/src/bluetooth/firmware.js
export async function updateFirmware(deviceId, firmwareFile) {
  // 1. Validar firmware file
  // 2. Iniciar modo de actualización BLE
  // 3. Enviar firmware en chunks
  // 4. Verificar integridad
  // 5. Confirmar instalación
}
```

#### 4.2 Endpoints:
```
POST /api/device/:id/firmware/update
- Body: { firmwareUrl, version }
- Response: { status, progress }

GET /api/device/:id/firmware/status
- Response: { updateInProgress, progress% }
```

---

## 🔧 Cambios en Código

### **1. Backend Changes**

#### Archivo: `backend/src/services/device-detector.js`
```diff
- const demoDevices = [...] // ❌ Eliminar
+ const noble = require('@noble/bluetooth');
+ 
+ async function scanRealDevices() {
+   return noble.discover(); // ✅ Scan real
+ }
```

#### Archivo: `backend/src/routes/device.js`
```diff
+ router.post('/:id/volume', setVolumeHandler);
+ router.post('/:id/program', switchProgramHandler);
+ router.post('/:id/firmware/update', updateFirmwareHandler);
+ router.get('/:id/firmware/status', getFirmwareStatusHandler);
```

### **2. Frontend Changes**

#### Archivo: `desktop/src/hooks/useDemoData.js` → `useRealDevices.js`
```diff
- globalDeviceState = { demo data } ❌
+ useEffect(() => {
+   socket.on('device:connected', handleDeviceConnected); ✅
+   socket.on('device:updated', handleDeviceUpdated);
+ }, []);
```

#### Archivo: `desktop/src/components/RealtimeMonitor.jsx`
```diff
const handleVolumeChange = (e) => {
  const newVol = parseInt(e.target.value);
-  setVolume(newVol); ❌ Demo
+  api.setVolume(device.id, newVol); ✅ Real
}
```

---

## 📦 Dependencias a Instalar

```bash
cd backend

# Bluetooth
npm install @noble/bluetooth
npm install noble  # Alternativa más estable

# Phonak (si disponible)
npm install phonak-noahlink  # Simulado

# Utils
npm install serialport  # Para conexiones USB
npm install events  # Para event emitting
```

---

## 🚀 Plan de Ejecución

### **Semana 1: Detección**
- [ ] Instalar librerías Bluetooth
- [ ] Crear `/bluetooth/real-detector.js`
- [ ] Reemplazar device-detector.js
- [ ] Testear detección en PC con audífonos reales
- [ ] Commit: "Add real Bluetooth device detection"

### **Semana 2: Volumen**
- [ ] Crear `/bluetooth/commands.js`
- [ ] Implementar setVolume API
- [ ] Testear en app real
- [ ] Commit: "Add real volume control"

### **Semana 3: Programas**
- [ ] Crear `/bluetooth/programs.js`
- [ ] Implementar switchProgram API
- [ ] Testear cambio de programas
- [ ] Commit: "Add real program switching"

### **Semana 4: Firmware**
- [ ] Crear `/bluetooth/firmware.js`
- [ ] Implementar updateFirmware API
- [ ] Testear actualización
- [ ] Commit: "Add real firmware update"

---

## 🧪 Testing Real

Para cada fase:

1. **Conecta audífonos Phonak** a tu PC
2. **Ejecuta la app** con `Iniciar NoahLink Pro.bat`
3. **Abre DevTools** (F12)
4. **Verifica en consola** que los audífonos se detecten
5. **Prueba cambios** de volumen/programa en los audífonos físicos
6. **Valida** que los cambios aparezcan en la app

---

## ⚠️ Consideraciones Importantes

1. **Permisos Bluetooth** - Windows puede pedir permisos
2. **Drivers** - Asegúrate que NoahLink Wireless esté instalado
3. **USB/Serial** - Algunos conexiones usan puerto serial
4. **Error Handling** - Conexiones pueden fallar, validar siempre
5. **Battery Drain** - Bluetooth puede drenar batería, optimizar

---

## 📡 Arquitectura Final

```
┌─────────────────────────────────────────────┐
│         Electron Desktop App                │
│  (React + Real Device Display)              │
└──────────────────┬──────────────────────────┘
                   │ WebSocket
┌──────────────────▼──────────────────────────┐
│      Node.js Backend (Express)              │
│  - Device Detection                         │
│  - Volume/Program Control                   │
│  - Firmware Updates                         │
└──────────────────┬──────────────────────────┘
                   │ Bluetooth
┌──────────────────▼──────────────────────────┐
│   Phonak Audífonos (BLE/NoahLink)          │
│  - Detección automática                     │
│  - Control de volumen                       │
│  - Cambio de programas                      │
│  - Actualización de firmware                │
└─────────────────────────────────────────────┘
```

---

## 💾 Próximos Pasos

1. ✅ **Lee este plan**
2. ⏭️ **Instala dependencias Bluetooth**
3. ⏭️ **Crea real-detector.js**
4. ⏭️ **Comienza Fase 1**

¿Empezamos? 🚀
