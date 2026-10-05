# 🎯 GUÍA PRÁCTICA: Capturar Protocolo BLE Phonak

**Objetivo**: Obtener los comandos exactos que Phonak usa para control de audífonos  
**Tiempo estimado**: 30-60 minutos  
**Dificultad**: Media

---

## 📥 PARTE 1: Instalación de Herramientas (5 min)

### Instalar Wireshark (Recomendado)

```powershell
# 1. Instalar Wireshark
choco install wireshark -y

# 2. Reiniciar PowerShell como Administrador

# 3. Verificar instalación
wireshark --version
```

### O usar nRF Connect (Más fácil)

**Descargar de**: https://www.nordicsemi.com/Products/nRF-Connect-for-Desktop

---

## 🔧 PARTE 2: Configuración de Captura

### Con Wireshark:

```
1. Abrir Wireshark como Administrador
2. Ir a: Capture > Interfaces
3. Buscar "Bluetooth" en la lista
4. Si no aparece:
   → Instalar: "Npcap"
   → Reiniciar computadora
   → Reconectar audífono
5. Hacer doble clic en interfaz Bluetooth
```

---

## 🎬 PARTE 3: Captura de Tráfico (20-30 min)

### Procedimiento:

```
1. Abre Wireshark y comienza captura

2. Abre Phonak Target
   C:\Program Files\Phonak\Phonak Target\Target.exe

3. Operación 1: VOLUMEN
   ├─ Subir a 100%
   ├─ Bajar a 0%
   ├─ Poner en 50%
   └─ Esperar 2 seg entre cada cambio

4. Operación 2: PROGRAMA
   ├─ Cambiar a Música
   ├─ Cambiar a Restaurante
   ├─ Cambiar a Automático
   └─ Esperar 2 seg entre cambios

5. Operación 3: BATERÍA
   ├─ Ver nivel en Target
   └─ Esperar 5 segundos

6. Detener captura
```

---

## 🔍 PARTE 4: Análisis en Wireshark

### Filtrar tráfico BLE:

```
1. En "Filter": btle
2. Filtrar GATT Writes: att.opcode == 0x12
3. Para cada paquete:
   ├─ Anotar UUID característica
   ├─ Anotar bytes en HEX
   ├─ Anotar timestamp
   └─ Comparar patrones
```

### Plantilla de anotaciones:

```
=== VOLUMEN ===
0% → Bytes: [XX XX XX XX]
50% → Bytes: [XX XX XX XX]
100% → Bytes: [XX XX XX XX]
Patrón: Byte N = Volumen?

=== PROGRAMA ===
Automático → [XX XX XX XX]
Música → [XX XX XX XX]
Restaurante → [XX XX XX XX]

=== BATERÍA ===
Lectura: [XX XX]
Rango: 0-100%?
```

---

## 💾 PARTE 5: Documentar

### Crear tabla de UUIDs:

```
Volumen:
- Servicio: 0000XXXX-0000-1000-8000-00805f9b34fb
- Característica: 0000XXXX-0000-1000-8000-00805f9b34fb
- Rango: 0-255 o 0-100?
- Comando: [0x20, valor]?

Programa:
- Servicio: 0000XXXX-0000-1000-8000-00805f9b34fb
- Característica: 0000XXXX-0000-1000-8000-00805f9b34fb
- Índices: Auto=0, Música=1, etc.

Batería:
- Servicio: 0000180F (Battery Service estándar)
- Característica: 00002A19 (Battery Level estándar)
- Rango: 0-100%
```

---

## ✨ Resumen Rápido

1. Instala Wireshark (5 min)
2. Captura tráfico de Target (30 min)
3. Analiza en Wireshark (20 min)
4. Documenta UUIDs y comandos
5. ¡Listo para implementación!

---

*Guía actualizada: 2026-10-05*
