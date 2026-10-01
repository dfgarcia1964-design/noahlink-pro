# 🚀 Quick Start - NoahLink Pro

Guía rápida para comenzar el desarrollo de la Fase 1.

## 📋 Requisitos

- **Node.js** 18+ ([descargar](https://nodejs.org/))
- **npm** 9+ o **yarn**
- **Windows 10/11** con Bluetooth 5.0+
- **Naída UP 90** para testing

## 📂 Estructura Actual

```
noahlink-pro/
├── backend/                    ← Backend Node.js (EN DESARROLLO)
│   ├── src/
│   │   ├── index.js           ✅ Servidor Express
│   │   ├── bluetooth/
│   │   │   └── manager.js     ✅ Gestor Bluetooth
│   │   └── api/
│   │       └── routes.js      ✅ Rutas API
│   ├── package.json           ✅ Configurado
│   └── .env.example           ✅ Variables de entorno
│
├── desktop/                    ← Desktop App (PRÓXIMA)
├── mobile/                     ← Mobile App (Fase 5)
├── web/                        ← Web App (Fase 7)
└── docs/                       ← Documentación
```

## 🛠️ Instalación del Backend

### Paso 1: Preparar el proyecto

```bash
cd noahlink-pro/backend

# Copiar variables de entorno
copy .env.example .env

# Instalar dependencias
npm install
```

### Paso 2: Configurar .env

Edita `backend/.env`:

```env
PORT=3000
NODE_ENV=development
BLUETOOTH_SCAN_DURATION=10000
BLUETOOTH_RECONNECT_MAX_ATTEMPTS=5
CORS_ORIGIN=http://localhost:3001
```

### Paso 3: Iniciar servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# O producción
npm start
```

✅ Verás:
```
╔════════════════════════════════════════╗
║     NoahLink Pro Backend Server        ║
║     Version 0.1.0 - Fase 1             ║
╚════════════════════════════════════════╝

📡 Servidor escuchando en puerto 3000
🔵 Bluetooth: Inicializando...
```

## 🧪 Testing del Backend

### 1. Health Check

```bash
# En otro terminal
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-09-30T...",
  "uptime": 12.345,
  "bluetooth": "disconnected"
}
```

### 2. Escanear dispositivos Phonak

```bash
# Escanea por 5 segundos
curl "http://localhost:3000/api/v1/devices?duration=5000"
```

Respuesta esperada:
```json
{
  "success": true,
  "count": 1,
  "devices": [
    {
      "id": "abc123def456",
      "name": "Naída UP 90",
      "rssi": -50,
      "timestamp": "2026-09-30T..."
    }
  ]
}
```

### 3. Conectar a dispositivo

```bash
curl -X POST http://localhost:3000/api/v1/devices/abc123def456/connect
```

### 4. Obtener estado

```bash
curl http://localhost:3000/api/v1/devices/abc123def456/status
```

### 5. Leer batería

```bash
curl http://localhost:3000/api/v1/devices/abc123def456/battery
```

### 6. Cambiar volumen

```bash
curl -X POST http://localhost:3000/api/v1/devices/abc123def456/volume \
  -H "Content-Type: application/json" \
  -d '{"volume": 50}'
```

## 📱 Desktop App (Próximo)

La aplicación de escritorio (Electron + React) será desarrollada en paralelo.

Incluirá:
- ✅ Interfaz gráfica moderna
- ✅ Conexión visual a dispositivos
- ✅ Control remoto de volumen
- ✅ Visualización de batería
- ✅ Dashboard en tiempo real

## 📚 Documentación

- [README.md](./README.md) - Descripción completa
- [docs/PHASES.md](./docs/PHASES.md) - Detalles de cada fase
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura técnica (próxima)

## 🐛 Troubleshooting

### "noble cannot find bluetooth"
```
Error: Cannot find module 'noble'
```

**Solución:**
```bash
cd backend
npm install
npm run dev
```

### "No serialport"
```
Error: Cannot find module 'serialport'
```

**Solución:** Reinstalar con build tools:
```bash
npm rebuild
```

### Bluetooth no inicializa
```
Bluetooth state: unauthorized
```

**Soluciones:**
1. Ejecutar como administrador (Windows)
2. Habilitar Bluetooth en Windows
3. Reiniciar la aplicación

### CORS errors
Si el frontend no puede conectar al backend, verifica:
1. Backend corriendo en puerto 3000
2. CORS_ORIGIN en .env coincide con frontend
3. Headers CORS correctos

## 📞 Soporte

Para problemas:
1. Verifica logs del servidor
2. Consulta [docs/PHASES.md](./docs/PHASES.md)
3. Revisa la sección Troubleshooting

## ✅ Checklist Fase 1

- [ ] Backend funcionando
- [ ] Escaneo de dispositivos
- [ ] Conexión Bluetooth
- [ ] Lectura de batería
- [ ] Control de volumen
- [ ] Desktop app (próxima)

## 🎯 Próximos Pasos

1. **Ahora:** Fase 1 Backend ✅
2. **Semana 1-2:** Desktop Electron + React
3. **Semana 2-3:** Testing completo
4. **Semana 4:** Fase 2 - Control completo

---

**¿Necesitas ayuda?** Revisa los docs o abre un issue.

**Happy coding!** 🚀
