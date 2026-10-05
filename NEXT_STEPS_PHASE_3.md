# 🚀 NEXT STEPS: Phase 3 Ejecución

**Fecha**: 2026-10-05  
**Fase Actual**: Phase 2 ✅ → Phase 3 ⏳  
**Estimación Total**: 2-3 horas

---

## 📋 CHECKLIST PHASE 3

### Step 1: Instalar Wireshark (15 min)
- [ ] Descargar desde https://www.wireshark.org/download/
- [ ] Instalar (marcar "Install Npcap")
- [ ] Reiniciar computadora
- [ ] Verificar: `wireshark --version`

**Referencia**: `PHASE_3_WIRESHARK_SETUP.md` - Sección PASO 1

---

### Step 2: Preparar Captura (10 min)
- [ ] Asegurar Bluetooth activado
- [ ] Emparejar audífono Phonak
- [ ] Abrir Phonak Target
- [ ] Conectar audífono en Target
- [ ] Esperar 5 segundos de estabilización

**Referencia**: `PHASE_3_WIRESHARK_SETUP.md` - Sección PASO 2-3

---

### Step 3: Ejecutar Captura (30 min)
```
Wireshark:
1. Capture > Interfaces > Bluetooth
2. Click Start (botón azul)

Cambios en Phonak Target (30 min):
3. Volumen: 0% → 50% → 100% → 50% (2 seg entre cambios)
4. Programa: Auto → Música → Restaurante → Conversación
5. Batería: Verificar valor mostrado
6. Dejar ejecutándose 30 segundos más

Wireshark:
7. Click Stop (botón rojo)
8. File > Save As > "phonak_capture.pcapng"
```

**Referencia**: `PHASE_3_WIRESHARK_SETUP.md` - Sección PASO 4

---

### Step 4: Analizar Captura (45 min)
```
Manual (recomendado para aprender):
1. Abrir phonak_capture.pcapng en Wireshark
2. Filter: "btle"
3. Filtro avanzado: "att.opcode == 0x12"
4. Anotar UUIDs y valores HEX para cada operación

Automático (si tshark disponible):
python wireshark_analysis.py
```

**Salida esperada**:
- UUIDs de servicios volumen/programa/batería
- Valores HEX para cada comando
- Patrones de bytes que cambian

**Referencia**: `PHASE_3_WIRESHARK_SETUP.md` - Sección PASO 5

---

### Step 5: Documentar Resultados (30 min)
```
Actualizar en PHONAK_BLE_PROTOCOL_ANALYSIS.md:

## UUIDs Reales Descubiertos

### Volumen
- Servicio: 0000XXXX-0000-1000-8000-00805f9b34fb [DE WIRESHARK]
- Característica: 0000XXXX-0000-1000-8000-00805f9b34fb [DE WIRESHARK]
- Rango: 0-255 [VERIFICADO EN CAPTURA]
- Ejemplos:
  - 0% → 0x01 0x00 [VALOR REAL]
  - 50% → 0x01 0x80 [VALOR REAL]
  - 100% → 0x01 0xFF [VALOR REAL]

### Programa
- Servicio: 0000XXXX-0000-1000-8000-00805f9b34fb [DE WIRESHARK]
- Característica: 0000XXXX-0000-1000-8000-00805f9b34fb [DE WIRESHARK]
- Mapeo:
  - Automático → 0x02 0x00 [VALOR REAL]
  - Música → 0x02 0x01 [VALOR REAL]
  - Restaurante → 0x02 0x02 [VALOR REAL]
  - etc.

### Batería
- Servicio: 0000XXXX-0000-1000-8000-00805f9b34fb
- Característica: 0000XXXX-0000-1000-8000-00805f9b34fb
- Tipo: Read / Notify [VERIFICADO EN CAPTURA]
- Rango: 0-100% [VERIFICADO EN CAPTURA]
```

---

### Step 6: Actualizar Backend (30 min)
```javascript
// backend/src/bluetooth/ble-manager.js

Reemplazar:
this.phonakUUIDs = {
  services: {
    volume: 'REEMPLAZAR_UUID_REAL',  // ← UUID real de Wireshark
    program: 'REEMPLAZAR_UUID_REAL', // ← UUID real de Wireshark
    battery: '0000180F...',           // ← Verificar en Wireshark
  },
  characteristics: {
    volume: 'REEMPLAZAR_UUID_REAL',   // ← UUID real de Wireshark
    program: 'REEMPLAZAR_UUID_REAL',  // ← UUID real de Wireshark
    battery: '00002A19...',            // ← Verificar en Wireshark
  }
};

Con valores reales:
this.phonakUUIDs = {
  services: {
    volume: '0000XXXX-0000-1000-8000-00805f9b34fb',  // Real
    program: '0000YYYY-0000-1000-8000-00805f9b34fb', // Real
    ...
  }
};
```

---

### Step 7: Implementar GATT Write Real (45 min)

```javascript
// backend/src/bluetooth/ble-manager.js
// Reemplazar método setVolume() para usar Noble real:

async setVolume(deviceId, volumeLevel) {
  const device = this.connectedDevices.get(deviceId);
  const characteristic = device.characteristics.volume;
  
  const bleValue = Math.round((volumeLevel / 100) * 255);
  const command = this.buildCommand(0x01, bleValue); // opcode 0x01
  
  // IMPLEMENTAR:
  await characteristic.writeAsync(command, false);
  
  this.emit('volume-changed', { deviceId, volume: volumeLevel });
  return { success: true, device: device.name, volume: volumeLevel };
}

// Reemplazar método setProgram() similarmente:
async setProgram(deviceId, programName) {
  const programIndex = this.phonakCommands.program.programMap[programName];
  const command = this.buildCommand(0x02, programIndex); // opcode 0x02
  
  // IMPLEMENTAR:
  await characteristic.writeAsync(command, false);
  
  this.emit('program-changed', { deviceId, program: programName });
  return { success: true, device: device.name, program: programName };
}
```

---

### Step 8: Testing (30 min)
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend (en puerto 3001)
cd desktop
npm start

# Terminal 3: Test endpoints
curl -X POST http://localhost:3000/api/ble-control/scan -d '{"duration": 5000}'
# [Esperar que se descubran dispositivos]
curl -X POST http://localhost:3000/api/ble-control/connect/[deviceId]
curl -X POST http://localhost:3000/api/ble-control/volume/[deviceId] -d '{"volume": 75}'
# [Verificar que cambia en audífono REAL]
```

**Criterios de éxito**:
- ✅ Backend inicia sin errores
- ✅ Escaneo descubre audífonos
- ✅ Conexión exitosa
- ✅ Cambio de volumen → cambio en audífono físico
- ✅ Cambio de programa → cambio en audífono físico
- ✅ Lectura de batería en tiempo real

---

## 📊 Timeline Esperado

```
Actividad                    | Tiempo  | Acumulado
─────────────────────────────┼─────────┼──────────
1. Instalar Wireshark        | 15 min  | 0:15
2. Preparar captura          | 10 min  | 0:25
3. Ejecutar captura BLE      | 30 min  | 0:55
4. Analizar en Wireshark     | 45 min  | 1:40
5. Documentar resultados     | 30 min  | 2:10
6. Actualizar backend UUIDs  | 30 min  | 2:40
7. Implementar GATT Write    | 45 min  | 3:25
8. Testing completo          | 30 min  | 3:55

TOTAL ESTIMADO: ~4 HORAS
(Sin delays: 2-3 horas si todo fluye bien)
```

---

## 🎯 Después de Phase 3

Una vez completado:

1. **Commit y Push**
   ```bash
   git add -A
   git commit -m "Phase 3: Real BLE UUID mapping and GATT implementation"
   git push origin master
   ```

2. **Estado del Proyecto**
   - ✅ Phase 1: Device Detection - COMPLETO
   - ✅ Phase 2: Real BLE Control - COMPLETO
   - ✅ Phase 3: UUID Validation - COMPLETO
   - ⏳ Phase 4: Production Testing - SIGUIENTE
   - ⏳ Phase 5: UI Polish - SIGUIENTE

3. **Próximo Paso**: Phase 4 (Testing robusto con audífonos)

---

## 📞 Soporte en Vivo

Si necesitas ayuda:

1. **Wireshark no muestra Bluetooth**
   - Ver: `PHASE_3_WIRESHARK_SETUP.md` - Sección "Problemas Comunes"
   - Instalar Npcap manualmente: https://npcap.com/

2. **No hay paquetes en captura**
   - Asegurar que Phonak Target está abierto
   - Hacer cambios MÁS LENTOS (esperar 2 seg entre cambios)
   - Captura debe estar ACTIVA durante cambios

3. **UUIDs no coinciden con especificación**
   - ¡Es normal! Phonak puede usar UUIDs propietarios
   - Usar valores de Wireshark (la realidad)
   - Documentar diferencias

---

## ✨ Éxito Total = Cuando

```
1. ✅ Wireshark instalado
2. ✅ Tráfico BLE capturado
3. ✅ UUIDs documentados
4. ✅ Backend actualizado
5. ✅ GATT Write implementado
6. ✅ Cambio de volumen en app = cambio en audífono FÍSICO
7. ✅ Cambio de programa en app = cambio en audífono FÍSICO
8. ✅ Batería se actualiza en tiempo real en app
9. ✅ Commit y push completado
```

---

## 📚 Referencias

- `PHONAK_BLE_PROTOCOL_ANALYSIS.md` - Especificación técnica
- `PHASE_3_WIRESHARK_SETUP.md` - Guía paso a paso
- `PHONAK_QUICK_REFERENCE.md` - Tabla rápida
- `wireshark_analysis.py` - Script de análisis automatizado

---

**¡Listo para comenzar!** 🎧

*Próximo: Instalar Wireshark y capturar tráfico BLE real*

