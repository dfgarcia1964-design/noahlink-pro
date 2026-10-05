# 📡 Guía Práctica: Captura de Tráfico BLE con Wireshark

**Guía paso a paso para capturar y analizar protocolo Phonak en tiempo real**

---

## 🎯 Objetivo

Capturar paquetes BLE reales entre Phonak Target y audífonos para identificar estructura exacta de comandos.

---

## 📋 Requisitos Previos

### Hardware
- [ ] PC Windows con adaptador Bluetooth 5.0+ o USB BLE dongle
- [ ] Audífonos Phonak (modelo 2019+)
- [ ] Cable USB (para audífonos si aplica)

### Software
- [ ] Wireshark 4.0+ https://www.wireshark.org/download/
- [ ] Phonak Target instalado
- [ ] nRF Connect Desktop (opcional pero recomendado)
- [ ] Python 3.8+ (para scripts de análisis)

### Permisos
- [ ] Ejecutar Wireshark como administrador
- [ ] Acceso a interfaces de red Bluetooth

---

## 🔧 Configuración Inicial

### Paso 1: Verificar Adaptador Bluetooth

**Windows:**
```powershell
# PowerShell como administrador
Get-PnpDevice -Class Bluetooth | Select Name, Status

# Salida esperada:
# Name: Intel Wireless Bluetooth
# Status: OK

# Si no aparece, instalar drivers desde:
# https://www.intel.com/content/www/en/us/docs/wireless/quick-start-guide/wireless-bluetooth-driver-for-windows-10-11.html
```

**Verificar Wireshark reconoce interfaz:**
```bash
# Abrir Wireshark como administrador
# Ir a: Capture → Options
# Buscar en la lista:
#   - "Bluetooth"
#   - "Bluetooth adapter"
#   - "Intel Wireless Bluetooth"
#   - Cualquier entrada que incluya "Bluetooth"
```

### Paso 2: Instalar Npcap (Captura de red)

**Wireshark 4.0+ requiere Npcap:**

```bash
# Método 1: Instalación automática
# Durante instalación de Wireshark, marcar:
# ☑ Npcap (Install Npcap version X.XX)
# ☑ Install Npcap in WinPcap API-compatible mode

# Método 2: Manual
1. Descargar https://npcap.com/dist/
2. Ejecutar npcap-X.XX.exe
3. Seleccionar "Install Npcap in WinPcap API-compatible Mode"
4. Reiniciar PC
```

### Paso 3: Configurar Wireshark para BLE

**Archivo: `C:\Program Files\Wireshark\profiles\Compact\preferences`**

Agregar/modificar:

```ini
# Habilitar disectores BLE
# Edit → Preferences → Protocols → HCI_USB
# Enable HCI USB capture: ☑
# Enable packet editor: ☑

# Ir a: Protocols → BTLE
# Link-layer address type: Random
# Enable BLE Advertising Interval: ☑
```

---

## 🎬 Captura de Tráfico Phonak

### Escenario 1: Captura de Cambio de Volumen

**Preparación:**

```
1. Abrir Wireshark
2. Seleccionar interfaz Bluetooth
3. Ir a Capture → Options → Configure
4. En "Capture Filter", ingresar:
   btle
5. Marcar ☑ Promiscuous mode
6. Click "Start"
```

**Secuencia de captura:**

```
Paso 1: Iniciar captura (Wireshark mostrará "Capturing...")
Paso 2: Abrir Phonak Target
Paso 3: Conectar a audífonos (aguardar "Connected")
Paso 4: Cambiar volumen en la interfaz
         - Volumen 0 → Anotar timestamp
         - Volumen 50 → Anotar timestamp
         - Volumen 100 → Anotar timestamp
Paso 5: Cambiar volumen en audífono físico
         - Notar si sincroniza en Phonak Target
Paso 6: Parar captura (botón Stop)
```

**Duración recomendada:** 5-10 minutos de captura activa

### Escenario 2: Captura de Cambio de Programa

**Secuencia:**

```
Paso 1: Iniciar nueva captura
Paso 2: Conectar en Phonak Target
Paso 3: Cambiar programas:
         - Automático → Conversación (nota timestamp)
         - Conversación → Música (nota timestamp)
         - Música → Restaurante (nota timestamp)
         - Restaurante → Exterior (nota timestamp)
Paso 4: Parar captura
```

### Escenario 3: Captura de Lectura de Batería

**Secuencia:**

```
Paso 1: Iniciar captura
Paso 2: Conectar audífonos
Paso 3: Ver pantalla de batería en Phonak Target
Paso 4: Anotar intervalos de actualización
Paso 5: Parar captura
```

---

## 🔎 Análisis de Captura

### Filtros Wireshark para Localizar Paquetes

```
# Filtro básico - Solo BLE
btle

# Filtro GATT - Solo comunicación de atributos
btatt

# Filtro por opcode específico
btatt.opcode == 0x12    # Write Command (probablemente volumen)
btatt.opcode == 0x04    # Write Request (también escritura)
btatt.opcode == 0x1b    # Notification (respuesta del dispositivo)

# Filtro por dirección MAC (sustituir XX:XX:XX:XX:XX:XX)
btle.random_address == "D0:8C:F1:01:02:03"

# Filtro por servicio específico
btgatt.uuid == "110b"   # Audio Control Service

# Combinación: Buscar comando de volumen entre dos timestamps
btatt.opcode == 0x12 && frame.time_relative > 10.5 && frame.time_relative < 11.5
```

### Estructura de Paquete en Wireshark

**Pantalla típica al expandir paquete:**

```
Frame 1234: 28 bytes on wire (224 bits), 28 bytes captured (224 bits)
  Bluetooth Mesh
    Flags: 0x00
    Channel: 37
    Clock: 0x00000000
    RSSI: -45 dBm
  Bluetooth Low Energy
    LE Metadata
      Flags: 0x00
      Length: 24
  Attribute Protocol
    Opcode: 0x12 (Write Command)
    Handle: 0x0042
    Attribute Value
      78 50 00 15 (Los bytes reales del comando)
```

**Navegación para encontrar datos:**

```
1. Hacer clic en "Attribute Protocol" → expandir
2. Ver "Attribute Value" → copiar hex bytes
3. Anotar: [frame number] [timestamp] [bytes]
```

### Extracción de Datos Raw

**Método 1: Exportar a CSV**

```
File → Export Objects → HTTP/GATT
Seleccionar tabla de paquetes BLE
Click "Copy" para copiar todos los valores
Pegar en spreadsheet de Excel
```

**Método 2: Usar comando tshark (CLI de Wireshark)**

```bash
# Exportar solo payload GATT
tshark -r capture.pcapng -Y btatt -T fields -e btatt.value > gatt_values.txt

# Exportar con timestamps
tshark -r capture.pcapng -Y btatt -T fields -e frame.time -e btatt.value > gatt_with_time.txt

# Exportar solo paquetes Write Command
tshark -r capture.pcapng -Y "btatt.opcode == 0x12" -T fields -e btatt.value > write_commands.txt
```

**Analizar en Python:**

```python
# script: analyze_ble_capture.py
import re
from collections import Counter

def parse_gatt_dump(filename):
    """Parsear dump de Wireshark"""
    values = []
    
    with open(filename, 'r') as f:
        for line in f:
            # Limpiar formato de Wireshark
            hex_bytes = re.findall(r'[0-9a-f]{2}', line.lower())
            if hex_bytes:
                values.append(bytes(int(b, 16) for b in hex_bytes))
    
    return values

def find_command_pattern(values):
    """Buscar patrón consistente"""
    
    # Agrupar por longitud
    by_length = {}
    for v in values:
        l = len(v)
        if l not in by_length:
            by_length[l] = []
        by_length[l].append(v)
    
    print("Distribución de tamaños:")
    for length, items in sorted(by_length.items()):
        print(f"  {length} bytes: {len(items)} comandos")
    
    # Analizar primer byte (probablemente opcode)
    print("\nPrimer byte (opcode):")
    first_bytes = Counter(v[0] for v in values)
    for byte, count in first_bytes.most_common(5):
        print(f"  0x{byte:02X}: {count} veces")
    
    # Buscar cambios de volumen
    print("\nBuscar cambios de volumen (4 bytes con patrón):")
    four_byte_commands = [v for v in values if len(v) == 4]
    
    for cmd in four_byte_commands[:10]:
        xor_result = cmd[0] ^ cmd[1] ^ cmd[2]
        inv_xor = (~xor_result) & 0xFF
        
        print(f"  {' '.join(f'{b:02X}' for b in cmd)} ", end="")
        
        if inv_xor == cmd[3]:
            print(f"✓ Checksum XOR válido (byte[1]={cmd[1]})")
        else:
            print("")

# Usar
if __name__ == '__main__':
    values = parse_gatt_dump('gatt_values.txt')
    find_command_pattern(values)
```

---

## 📊 Tabla de Análisis Manual

**Crear tabla en papel o Excel:**

```
╔─────┬──────────┬────────┬───────────┬──────────┬──────────┐
║Nº   │Tiempo (s)│Acción  │Byte0 Byte1│Byte2 Byte3│Patrón    ║
╠─────╼──────────┼────────┼───────────┼──────────┼──────────┤
║1    │0.250     │Vol→50  │01 32      │CD CE     │Op+Vol+Inv║
║2    │0.350     │Vol→75  │01 4B      │B4 B5     │+Checksum ║
║3    │0.500     │Vol→100 │01 64      │9B 9C     │          ║
║4    │1.200     │Prog→   │02 01      │FC FD     │Program   ║
║5    │1.350     │        │02 02      │FB FC     │          ║
╚─────╧──────────╧────────╧───────────╧──────────╧──────────╝
```

---

## 🔍 Búsqueda Específica de Valores

### Encontrar dónde Phonak envía volumen actual

```
Wireshark Filter:
btatt.opcode == 0x1b   # Notifications (respuestas del dispositivo)

Buscar en cada notification:
- Patrones que varían 0x00-0xFF
- Notificaciones frecuentes (probablemente batería)
- Notificaciones ocasionales (cambio de volumen)
```

### Encontrar dirección del dispositivo real

```
En Wireshark, cuando conectes audífono:
1. Ver "Bluetooth Mesh" → "Flags" 
2. Buscar patrón "random_address" 
3. Copiar dirección MAC
4. Usar en filtros:
   btle.random_address == "XX:XX:XX:XX:XX:XX"
```

### Identificar características por UUID

```
En captura, buscar "Services" y "Characteristics"
Wireshark mostrará:
Service: 0x180A (Device Information)
  Characteristic: 0x2A29 (Manufacturer Name)
  Characteristic: 0x2A24 (Model Number)

Service: 0x110B (Audio Control) ← Probablemente volumen
  Characteristic: XXXX (Write)
  Characteristic: YYYY (Notify)

Service: 0x180F (Battery)
  Characteristic: 0x2A19 (Battery Level)
```

---

## 💾 Guardar y Exportar Captura

### Guardar captura

```
File → Save As
Formato: *.pcapng (Wireshark format)
Ubicación: C:\Users\[user]\Downloads\phonak_capture_YYYY-MM-DD.pcapng

Luego puedes:
- Abrir de nuevo para re-analizar
- Compartir con otros para validar resultados
- Comparar múltiples capturas
```

### Exportar para análisis

```
File → Export Objects → Protocol (depende de contenido)

O usar línea de comandos:
tshark -r phonak.pcapng -T pdml > analysis.xml  # XML completo
tshark -r phonak.pcapng -T text > analysis.txt  # Texto plano
```

### Documentar hallazgos

**Template de documento:**

```markdown
## Captura: [Fecha] - [Tipo de acción]

**Archivo:** `phonak_capture_2026-10-05.pcapng`

**Configuración:**
- Dispositivo: Phonak AUDÉO M30-312T
- MAC: D0:8C:F1:01:02:03
- Aplicación: Phonak Target v5.2.3
- Wireshark: 4.0.6

**Acciones capturadas:**
1. Volumen 0 → 50
2. Volumen 50 → 100
3. Cambio programa: Auto → Music

**Hallazgos:**

### Comando de Volumen
- Estructura: [0x01][Vol][Inv][Chk]
- Opcode: 0x01
- Rango volumen: 0x00-0xFF (0-100 en UI)
- Checksum: XOR invertido
- Handles: 0x0042 (write), 0x0043 (notify)

Ejemplos:
- Vol 0: 01 00 FF 00
- Vol 50: 01 32 CD CE
- Vol 100: 01 64 9B 9C

Validación checksum:
0x01 ^ 0x32 ^ 0xCD = 0x33
~0x33 & 0xFF = 0xCC ✓

### Comando de Programa
- Estructura: [0x02][ProgramID][Checksum]
- Programa automático: 02 00 FD
- Programa música: 02 02 FB

**Notas especiales:**
- Phonak Target muestra cambios con ~50ms de delay
- Audífono responde inmediatamente
- Notificaciones llegan cada 1-2 segundos
```

---

## 🐛 Solución de Problemas

### Problema: "No Bluetooth interface found"

**Soluciones:**
```
1. Verificar que adaptador está conectado
   Win + X → Device Manager
   → Bluetooth → Ver si está listado

2. Reinstalar drivers
   https://www.intel.com/content/www/us/en/docs/wireless/

3. Ejecutar Wireshark como administrador
   (click derecho → Run as administrator)

4. Desinstalar y reinstalar Npcap
   Panel Control → Uninstall → Npcap
   Descargar nuevamente: https://npcap.com/dist/
```

### Problema: "Capturing but seeing no packets"

**Soluciones:**
```
1. Asegurar que audífonos están conectados
   Menu Windows → Settings → Bluetooth
   Verificar que aparecen como "Connected"

2. Activar acciones en Phonak Target
   Cambiar volumen, programa mientras captura

3. Cambiar canal BLE
   Capture → Options → Channel: 37 (ó 38, 39)

4. Usar filtro más específico
   btle.random_address == "XX:XX:XX:XX:XX:XX"
```

### Problema: "Wireshark crashes with Bluetooth capture"

**Soluciones:**
```
1. Actualizar Wireshark a 4.0.6+
   Help → Check for Updates

2. Desactualizar Npcap a versión estable
   npcap.com/dist/ → versión 1.x más reciente

3. Usar alternative: nRF Connect Desktop
   Mejor estabilidad, interfaz más amigable
```

---

## 🎓 Ejemplos de Análisis Completo

### Ejemplo 1: Volumen 0 a 100

**Captura en Wireshark:**
```
Frame 245: BLE Write Command
  Timestamp: 10.523456 s
  Handle: 0x0042
  Value: 01 64 9B 9C

Frame 246: Device Notification (opcional)
  Handle: 0x0043
  Value: 01 64 9B 9C   (echo del cambio)
```

**Análisis:**
```
Byte 0: 0x01 = Opcode volumen
Byte 1: 0x64 = 100 decimal
Byte 2: 0x9B = Validación (inv opcode? no)
Byte 3: 0x9C = Checksum

Verificar checksum:
0x01 ^ 0x64 = 0x65
~0x65 & 0xFF = 0x9A ... ¡No coincide!

Probar otra fórmula:
(0x01 + 0x64) & 0xFF = 0x65
~0x65 & 0xFF = 0x9A ... Tampoco

Esperar, revisar byte 2:
0x01 ^ 0x64 ^ 0x9B = 0xFE
Esto es inverso de 0x01 ^ 0x64 = 0x65 
¡Entonces byte 2 ES parte del checksum!

Verificar con todos 3:
0x01 ^ 0x64 ^ 0x9B = 0xFE
~0xFE & 0xFF = 0x01
Hmmm...

Intentar: Byte 3 es XOR de todos
0x01 ^ 0x64 ^ 0x9B ^ 0x9C = 0x67
No es cero...

Conclusión: Requiere más análisis
Posible patrón alternativo o encriptación
```

### Ejemplo 2: Programa Automático (0x00)

**Captura:**
```
Frame 450: BLE Write Command
  Handle: 0x0045
  Value: 02 00 FD

Frame 451: Notification (confirmación)
  Value: 02 00 FD
```

**Análisis:**
```
Byte 0: 0x02 = Opcode programa (diferente a volumen)
Byte 1: 0x00 = ID programa (0=automático)
Byte 2: 0xFD = Checksum

Verificar:
0x02 ^ 0x00 = 0x02
~0x02 & 0xFF = 0xFD ✓

¡PATRÓN CONFIRMADO!
Checksum = ~(Byte0 ^ Byte1) & 0xFF
```

---

## 📈 Flujo Completo de Captura y Análisis

```
PASO 1: Preparación
  ✓ Conectar adaptador Bluetooth
  ✓ Instalar Wireshark + Npcap
  ✓ Ejecutar como admin
  ✓ Seleccionar interfaz BLE

PASO 2: Captura
  ✓ Iniciar captura
  ✓ Conectar audífonos en Phonak Target
  ✓ Cambiar volumen (0, 50, 100)
  ✓ Cambiar programas
  ✓ Esperar notificaciones
  ✓ Parar captura

PASO 3: Análisis
  ✓ Aplicar filtro btatt.opcode == 0x12
  ✓ Expandir cada paquete
  ✓ Copiar valor de Attribute Value
  ✓ Anotar en tabla

PASO 4: Validación
  ✓ Calcular checksum
  ✓ Verificar patrón
  ✓ Probar fórmulas matemáticas
  ✓ Documentar resultado

PASO 5: Documentación
  ✓ Escribir estructura de comando
  ✓ Listar ejemplos
  ✓ Guardar captura .pcapng
  ✓ Crear archivo de referencia
```

---

## 📚 Recursos de Referencia

- Descargar Wireshark: https://www.wireshark.org/download/
- Especificación BLE: https://www.bluetooth.com/specifications/
- nRF Connect: https://www.nordicsemiconductor.com/products/nrf-connect-for-desktop/
- Wireshark BLE Wiki: https://wiki.wireshark.org/Bluetooth

---

**Documento práctico para captura BLE Phonak**
*Versión 1.0 | 2026-10-05*
