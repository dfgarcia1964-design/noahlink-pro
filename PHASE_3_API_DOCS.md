# 📡 Phase 3 - Backend API Documentation

**Version:** 0.3.0  
**Base URL:** `http://localhost:3000/api/v1`  
**Content-Type:** `application/json`

---

## 📋 PROGRAMS API

### GET /programs
Obtiene todos los programas personalizados.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "programs": [
    {
      "id": "prog-001",
      "name": "Reunión",
      "frequencies": {
        "100": 3,
        "500": 5,
        "1000": 7,
        "2000": 9,
        "4000": 12,
        "8000": 10
      },
      "createdAt": "2026-09-24T...",
      "updatedAt": "2026-10-01T..."
    }
  ]
}
```

---

### GET /programs/:programId
Obtiene un programa específico.

**Parameters:**
- `programId` (string, required) - ID del programa

**Response:** (200 OK)
```json
{
  "success": true,
  "program": { ... }
}
```

**Errors:**
- 404 Not Found - Programa no existe

---

### POST /programs
Crea un nuevo programa personalizado.

**Request Body:**
```json
{
  "name": "Mi Programa",
  "frequencies": {
    "100": 5,
    "500": 8,
    "1000": 10,
    "2000": 12,
    "4000": 15,
    "8000": 18
  }
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "Program created",
  "program": { ... }
}
```

---

### PUT /programs/:programId
Actualiza un programa existente.

**Parameters:**
- `programId` (string, required) - ID del programa

**Request Body:**
```json
{
  "name": "Programa Actualizado",
  "frequencies": { ... }
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Program updated",
  "program": { ... }
}
```

---

### DELETE /programs/:programId
Elimina un programa.

**Parameters:**
- `programId` (string, required) - ID del programa

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Program deleted",
  "program": { ... }
}
```

---

## 📊 ANALYTICS API

### GET /analytics/trends
Obtiene tendencias de batería.

**Query Parameters:**
- `range` (optional) - '24h' (default), '7d', '30d', '90d'

**Response:**
```json
{
  "success": true,
  "analytics": {
    "current": 85,
    "average": 72,
    "min": 45,
    "max": 100,
    "timeRange": "24h",
    "history": [
      { "timestamp": "...", "level": 85 },
      { "timestamp": "...", "level": 84 }
    ],
    "prediction": {
      "estimatedTime": "~8 horas",
      "estimatedDepletion": "2026-10-01T17:00:00Z",
      "trend": "stable"
    }
  }
}
```

---

### GET /analytics/distribution
Obtiene distribución de niveles de batería.

**Response:**
```json
{
  "success": true,
  "distribution": {
    "excellent": {
      "count": 10,
      "percentage": 40
    },
    "good": {
      "count": 12,
      "percentage": 48
    },
    "low": {
      "count": 3,
      "percentage": 12
    }
  }
}
```

---

### GET /analytics/insights
Obtiene insights automáticos.

**Response:**
```json
{
  "success": true,
  "insights": {
    "averageUsagePerHour": "3.5%",
    "batteryTrend": "stable",
    "recommendations": [
      "Tu uso promedio es 3-4% por hora",
      "La batería se mantiene estable durante el día",
      "Se recomienda cargar antes de las 20:00",
      "Uso más eficiente en modo Conversación"
    ],
    "lastUpdated": "2026-10-01T..."
  }
}
```

---

## 👤 PROFILES API

### GET /profiles
Obtiene todos los perfiles de usuario.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "profiles": [
    {
      "id": "profile-001",
      "name": "Perfil Principal",
      "device": "Naída UP 90",
      "programs": 5,
      "active": true,
      "createdAt": "2026-09-01T..."
    }
  ]
}
```

---

### GET /profiles/:profileId
Obtiene un perfil específico.

**Response:**
```json
{
  "success": true,
  "profile": { ... }
}
```

---

### POST /profiles
Crea un nuevo perfil de usuario.

**Request Body:**
```json
{
  "name": "Nuevo Perfil",
  "device": "Naída UP 90",
  "programs": 3
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "Profile created",
  "profile": { ... }
}
```

---

### PUT /profiles/:profileId
Actualiza un perfil (incluyendo activación).

**Request Body:**
```json
{
  "name": "Nombre Actualizado",
  "active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated",
  "profile": { ... }
}
```

---

### DELETE /profiles/:profileId
Elimina un perfil.

**Response:**
```json
{
  "success": true,
  "message": "Profile deleted",
  "profile": { ... }
}
```

---

## ⚙️ SETTINGS API

### GET /settings
Obtiene la configuración del usuario.

**Response:**
```json
{
  "success": true,
  "settings": {
    "autoConnect": true,
    "updateFrequency": 30,
    "notificationsEnabled": true,
    "soundAlerts": true,
    "vibration": true,
    "batteryThreshold": 20,
    "autoBackup": true,
    "dataCollection": false,
    "darkMode": false,
    "language": "es"
  }
}
```

---

### PUT /settings
Actualiza la configuración del usuario.

**Request Body:**
```json
{
  "darkMode": true,
  "language": "en",
  "notificationsEnabled": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated",
  "settings": { ... }
}
```

---

### POST /settings/reset
Restablece los valores por defecto.

**Response:**
```json
{
  "success": true,
  "message": "Settings reset to defaults",
  "settings": { ... }
}
```

---

## 🔔 ALERTS API

### GET /alerts
Obtiene todas las alertas.

**Query Parameters:**
- `type` (optional) - 'battery', 'system', 'connection', 'program', 'maintenance'
- `read` (optional) - 'true' o 'false'

**Response:**
```json
{
  "success": true,
  "count": 5,
  "unread": 2,
  "alerts": [
    {
      "id": "alert-001",
      "type": "battery",
      "severity": "warning",
      "title": "Batería Baja",
      "message": "Nivel de batería en 18%...",
      "timestamp": "2026-10-01T14:35:00Z",
      "read": false
    }
  ]
}
```

---

### GET /alerts/:alertId
Obtiene una alerta específica.

**Response:**
```json
{
  "success": true,
  "alert": { ... }
}
```

---

### POST /alerts
Crea una nueva alerta.

**Request Body:**
```json
{
  "type": "battery",
  "severity": "warning",
  "title": "Batería Baja",
  "message": "Nivel de batería por debajo del umbral"
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "Alert created",
  "alert": { ... }
}
```

---

### PUT /alerts/:alertId
Marca una alerta como leída.

**Request Body:**
```json
{
  "read": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alert updated",
  "alert": { ... }
}
```

---

### DELETE /alerts/:alertId
Elimina una alerta.

**Response:**
```json
{
  "success": true,
  "message": "Alert deleted",
  "alert": { ... }
}
```

---

### POST /alerts/mark-all/read
Marca todas las alertas como leídas.

**Response:**
```json
{
  "success": true,
  "message": "All alerts marked as read"
}
```

---

### DELETE /alerts
Elimina todas las alertas.

**Response:**
```json
{
  "success": true,
  "message": "5 alerts deleted"
}
```

---

## 📋 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource not found |
| 500 | Server Error |

---

## 🧪 Testing with cURL

### Get all programs
```bash
curl http://localhost:3000/api/v1/programs
```

### Create a new program
```bash
curl -X POST http://localhost:3000/api/v1/programs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Programa",
    "frequencies": {
      "100": 5,
      "500": 8,
      "1000": 10,
      "2000": 12,
      "4000": 15,
      "8000": 18
    }
  }'
```

### Get analytics trends
```bash
curl "http://localhost:3000/api/v1/analytics/trends?range=24h"
```

### Get all profiles
```bash
curl http://localhost:3000/api/v1/profiles
```

### Create a new profile
```bash
curl -X POST http://localhost:3000/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Oficina",
    "device": "Naída UP 90",
    "programs": 3
  }'
```

### Get user settings
```bash
curl http://localhost:3000/api/v1/settings
```

### Update settings
```bash
curl -X PUT http://localhost:3000/api/v1/settings \
  -H "Content-Type: application/json" \
  -d '{
    "darkMode": true,
    "language": "en"
  }'
```

### Get all alerts
```bash
curl http://localhost:3000/api/v1/alerts
```

### Filter alerts by type
```bash
curl "http://localhost:3000/api/v1/alerts?type=battery&read=false"
```

### Create an alert
```bash
curl -X POST http://localhost:3000/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "type": "battery",
    "severity": "warning",
    "title": "Batería Baja",
    "message": "Nivel de batería en 15%"
  }'
```

---

## 📊 Data Models

### Program
```javascript
{
  id: string,
  name: string,
  frequencies: {
    100: number (0-25),
    500: number (0-25),
    1000: number (0-25),
    2000: number (0-25),
    4000: number (0-25),
    8000: number (0-25)
  },
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Profile
```javascript
{
  id: string,
  name: string,
  device: string,
  programs: number,
  active: boolean,
  createdAt: ISO8601
}
```

### Alert
```javascript
{
  id: string,
  type: 'battery' | 'system' | 'connection' | 'program' | 'maintenance',
  severity: 'error' | 'warning' | 'info' | 'success',
  title: string,
  message: string,
  timestamp: ISO8601,
  read: boolean
}
```

---

## 🔐 Security Notes

- All endpoints accept `application/json`
- CORS enabled for `http://localhost:3001`
- Helmet security headers enabled
- Request logging with Morgan
- Input validation on all POST/PUT endpoints

---

**Last Updated:** 2026-10-01  
**Status:** ✅ Complete
