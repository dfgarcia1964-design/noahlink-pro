# 📡 PHASE 3: Wireshark Setup y Captura BLE

**Fecha**: 2026-10-05  
**Objetivo**: Capturar tráfico BLE real de audífonos Phonak  
**Estimación**: 2-3 horas

---

## 🚀 PASO 1: Instalar Wireshark (10 minutos)

### Opción A: Instalación Gráfica (Recomendado)

1. Descargar desde: https://www.wireshark.org/download/
2. Seleccionar versión Windows (64-bit)
3. Ejecutar instalador
4. **✓ Marcar**: "Install Npcap"
5. Permitir cambios en el sistema
6. Finalizar instalación
7. Reiniciar computadora

### Opción B: Instalación por Terminal

```powershell
# Usando Scoop (si está disponible)
scoop install wireshark npcap

# O descargar el instalador manualmente
$url = "https://1.na.dl.wireshark.org/win64/Wireshark-latest-x64-setup.exe"
Invoke-WebRequest -Uri $url -OutFile "$env:TEMP\wireshark-setup.exe"
& "$env:TEMP\wireshark-setup.exe"
```

### Verificar Instalación

```powershell
wireshark --version
```

---

## 🎯 PASO 2: Preparar Ambiente (5 minutos)

### Requisitos:
- ✅ Wireshark instalado
- ✅ Npcap instalado (viene con Wireshark)
- ✅ Audífono Phonak emparejado con computadora
- ✅ Phonak Target abierto y funcionando
- ✅ Permisos de administrador

### Verificar Bluetooth:

```powershell
# Listar dispositivos Bluetooth emparejados
Get-CimInstance -Class Win32_PnPDevice -Filter "Description like '%Bluetooth%'" | 
Select-Object Name, Description
```

---

## 📊 PASO 3: Configurar Wireshark (5 minutos)

1. Abrir Wireshark **como Administrador**
2. Ir a **Capture > Interfaces**
3. Buscar adaptador Bluetooth (típicamente "Bluetooth adapter" o "hci0")
4. Si no aparece:
   - Cerrar Wireshark
   - Ejecutar Command Prompt como Admin
   - ```powershell
     npcap -i
     ```
   - Reintentar paso 2

5. Seleccionar interfaz Bluetooth
6. Click en el botón azul "Start" o el ícono de captura

---

## 🎬 PASO 4: Capturar Tráfico (30 minutos)

### Procedimiento:

```
[Wireshark Captura Activa]

⏱️ 00:00 - Iniciar captura

⏱️ 00:05 - Abrir Phonak Target
        - Conectar audífono (si no está conectado)
        - Esperar estabilización (5 segundos)

⏱️ 00:10 - OPERACIÓN 1: VOLUMEN
        Hacer esto en Phonak Target:
        1. Cambiar volumen a 0% (mínimo)
        2. Esperar 2 segundos
        3. Cambiar volumen a 50%
        4. Esperar 2 segundos
        5. Cambiar volumen a 100% (máximo)
        6. Esperar 2 segundos
        7. Volver a 50%
        
        En Wireshark: Anota timestamps aproximados

⏱️ 00:15 - OPERACIÓN 2: PROGRAMAS
        Cambiar en este orden:
        1. → Automático
        2. Esperar 2 segundos
        3. → Música
        4. Esperar 2 segundos
        5. → Restaurante
        6. Esperar 2 segundos
        7. → Conversación
        
        En Wireshark: Nota qué bytes cambian

⏱️ 00:20 - OPERACIÓN 3: BATERÍA
        En Phonak Target:
        1. Ver pantalla de batería
        2. Anotar valor mostrado
        3. Esperar 3 segundos
        
        En Wireshark: Buscar paquetes con número de batería

⏱️ 00:22 - Detener captura
        Click: Capture > Stop (o ícono de stop rojo)
        
⏱️ 00:23 - Guardar captura
        File > Save As > "phonak_capture.pcapng"
```

---

## 🔍 PASO 5: Analizar Captura en Wireshark (45 minutos)

### Filtrar Tráfico BLE:

1. En el campo de filtro (arriba):
   ```
   btle
   ```
   Presionar Enter

2. Ver solo paquetes BLE

### Encontrar GATT Writes (Comandos):

```
att.opcode == 0x12
```

Esto muestra solo "Write Request" commands.

### Para cada comando capturado:

```
Anotaciones a recopilar:

┌─ VOLUMEN 0% ──────────────────────────
├─ Timestamp (Wireshark): ___________
├─ Packet #: ___________
├─ Source: ___________
├─ UUID Característica: ___________
├─ Attribute Value (HEX): ___________
│  [ejemplo: "01 00 ff"] 
└─

┌─ VOLUMEN 50% ──────────────────────────
├─ Timestamp: ___________
├─ Packet #: ___________
├─ Attribute Value (HEX): ___________
│  [comparar con 0%]
└─

┌─ VOLUMEN 100% ──────────────────────────
├─ Timestamp: ___________
├─ Packet #: ___________
├─ Attribute Value (HEX): ___________
│  [patrón: byte N = volumen?]
└─

┌─ PROGRAMA: Automático ──────────────────
├─ Attribute Value (HEX): ___________
└─

┌─ PROGRAMA: Música ──────────────────────
├─ Attribute Value (HEX): ___________
│  [cambió desde Automático?]
└─

[Continuar con todos los programas...]

┌─ BATERÍA ───────────────────────────────
├─ Tipo: Read / Notification?
├─ Attribute Value (HEX): ___________
│  [número visible = batería?]
└─
```

---

## 📝 PASO 6: Documentar Resultados

### Crear tabla de UUIDs descubiertos:

```markdown
## UUIDs Reales Encontrados

### Servicio de Volumen
- UUID: `0000XXXX-0000-1000-8000-00805f9b34fb`
- Característica: `0000XXXX-0000-1000-8000-00805f9b34fb`
- Comando Volumen 0%: `[XX XX XX]`
- Comando Volumen 50%: `[XX XX XX]`
- Comando Volumen 100%: `[XX XX XX]`
- **Patrón**: Byte N = volumen (0-255)

### Servicio de Programa
- UUID: `0000XXXX-0000-1000-8000-00805f9b34fb`
- Característica: `0000XXXX-0000-1000-8000-00805f9b34fb`
- Comando Automático: `[XX XX XX]`
- Comando Música: `[XX XX XX]`
- Comando Restaurante: `[XX XX XX]`
- **Mapeo**: 
  - 0x00 = Automático
  - 0x01 = Música
  - 0x02 = Restaurante
  - etc.

### Servicio de Batería
- UUID: `0000180F-0000-1000-8000-00805f9b34fb` (estándar)
- Característica: `00002A19-0000-1000-8000-00805f9b34fb` (estándar)
- Tipo: Notification / Read
- Valor: `[XX]` = batería en %
```

---

## ⚠️ Problemas Comunes

### "Cannot capture on Bluetooth interface"
```
Solución:
1. Cerrar Wireshark
2. Ejecutar como Administrador
3. Verificar Npcap: control panel > Programs > Npcap
4. Si no aparece Bluetooth, reinstalar Npcap
```

### "No packets appearing"
```
Solución:
1. Verificar que el audífono está emparejado
2. Abrir Phonak Target primero
3. Esperar 3 segundos antes de interactuar
4. Hacer cambios de volumen MÁS LENTOS (2 seg entre cambios)
```

### "Filtered results empty"
```
Solución:
1. Limpiar filtro (dejar vacío)
2. Ver tráfico sin filtro primero
3. Buscar patrones en hexadecimal (valores que cambian)
4. Usar Wireshark > Analyze > Enabled Protocols > BLE
```

---

## 🎯 Éxito = Cuando veas:

✅ Paquetes GATT con valores HEX que cambian  
✅ Mismo UUID característica para todas las operaciones  
✅ Valores volumen correlacionados con cambios UI  
✅ Valores programa correlacionados con cambios UI  
✅ Batería = valor 0-100%  

---

## 💾 Después de Capturar

1. Guardar archivo `.pcapng`
2. Documentar en `PHONAK_BLE_PROTOCOL_ANALYSIS.md`
3. Actualizar `ble-manager.js` con UUIDs reales
4. Implementar GATT Write/Read con valores reales
5. Testing con Phonak Target

---

## 📞 Soporte Rápido

**Si Wireshark no muestra Bluetooth:**
- Descargar Npcap separadamente: https://npcap.com/
- Instalar sin Winpcap compatibility

**Si no hay paquetes:**
- Cambiar volume en Target DURANTE captura
- Ver tráfico en tiempo real sin filtros

**Si Phonak se desconecta:**
- Reconectar en Target
- Retomar captura

---

## 📋 Checklist

- [ ] Wireshark instalado
- [ ] Npcap disponible
- [ ] Bluetooth activado
- [ ] Audífono emparejado
- [ ] Phonak Target funcionando
- [ ] Captura iniciada
- [ ] Volumen 0% capturado
- [ ] Volumen 50% capturado
- [ ] Volumen 100% capturado
- [ ] Programas capturados
- [ ] Batería capturada
- [ ] Archivo guardado
- [ ] UUIDs documentados
- [ ] ble-manager.js actualizado
- [ ] Backend testado con UUIDs reales

---

*Documento actualizado: 2026-10-05*  
*Phase 3: Wireshark UUID Capture*
