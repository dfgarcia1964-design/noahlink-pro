# FASE 2 - PLAN DE IMPLEMENTACIÓN DETALLADO

**Fecha Inicio:** 2026-10-03  
**Versión Objetivo:** 0.2.0  
**Duración Estimada:** 3-4 semanas  

---

## 🎯 OBJETIVOS FASE 2

### P0 - Must Have (Esencial)
1. ✅ Dashboard en tiempo real
2. ✅ Monitoreo de batería con actualizaciones en vivo
3. ✅ Switching de programas desde UI
4. ✅ Logging de eventos
5. ✅ WebSocket para notificaciones instantáneas

### P1 - Should Have (Importante)
1. 🔄 Gráfico de tendencias de batería (24h)
2. 🔄 Filtrado y búsqueda de eventos
3. 🔄 Alertas de batería baja
4. 🔄 Reconexión automática de dispositivos

### P2 - Nice to Have (Opcional)
1. ⚪ Predicción de batería
2. ⚪ Exportar eventos a CSV
3. ⚪ Crear programas personalizados
4. ⚪ Auto-guardado de configuración

---

## 📋 PLAN DE TRABAJO POR ITERACIÓN

### **ITERACIÓN 1: BACKEND - Almacenamiento de Datos (2-3 días)**

#### Tarea 1.1: Crear sistema de almacenamiento JSON
- [ ] `backend/data/battery-history.json` - Historial de 7 días
- [ ] `backend/data/events.json` - Registro de 30 días
- [ ] `backend/data/device-state.json` - Estado actual
- [ ] Crear estructura de carpetas

#### Tarea 1.2: Implementar endpoints de historial
- [ ] `GET /api/v1/devices/:id/battery/history` - Último 24h
- [ ] `GET /api/v1/devices/:id/battery/history?days=7` - Últimos 7 días
- [ ] `POST /api/v1/devices/:id/battery/record` - Guardar registro

#### Tarea 1.3: Implementar endpoints de eventos
- [ ] `GET /api/v1/devices/:id/events` - Listar eventos
- [ ] `GET /api/v1/devices/:id/events?type=battery` - Filtrar por tipo
- [ ] `POST /api/v1/devices/:id/events` - Crear evento
- [ ] `DELETE /api/v1/devices/:id/events/:eventId` - Eliminar evento

#### Tarea 1.4: Implementar endpoints de programas
- [ ] `GET /api/v1/devices/:id/programs` - Listar programas
- [ ] `POST /api/v1/devices/:id/programs/:programId/switch` - Cambiar programa
- [ ] `POST /api/v1/devices/:id/programs` - Crear programa personalizado

---

### **ITERACIÓN 2: BACKEND - WebSocket (2-3 días)**

#### Tarea 2.1: Configurar Socket.io
- [ ] Instalar socket.io en backend
- [ ] Configurar CORS para WebSocket
- [ ] Crear manejador de conexiones

#### Tarea 2.2: Implementar canales WebSocket
- [ ] `/ws/device/:id/battery` - Actualizaciones de batería
- [ ] `/ws/device/:id/events` - Nuevos eventos en tiempo real
- [ ] `/ws/device/:id/status` - Cambios de estado

#### Tarea 2.3: Integrar con servicios existentes
- [ ] Emitir eventos de batería cada 30 segundos
- [ ] Emitir eventos cuando cambian dispositivos
- [ ] Emitir eventos cuando se registran nuevos eventos

---

### **ITERACIÓN 3: FRONTEND - Componentes Base (3-4 días)**

#### Tarea 3.1: Dashboard principal
- [ ] Crear `Dashboard.jsx` layout
- [ ] Navbar con título y opciones
- [ ] Grid layout para dispositivos
- [ ] Responsive design (mobile/tablet/desktop)

#### Tarea 3.2: Componentes de dispositivo
- [ ] `DeviceCard.jsx` - Tarjeta de dispositivo
  - Nombre y modelo
  - Estado de conexión
  - Botón de acciones rápidas
  - Indicador visual de estado

#### Tarea 3.3: Monitor en tiempo real
- [ ] `RealtimeMonitor.jsx` - Vista detallada del dispositivo
  - Batería actual en grande
  - Indicador de volumen
  - Estado de programas activos
  - Últimos eventos

---

### **ITERACIÓN 4: FRONTEND - Gráficos y Analytics (3-4 días)**

#### Tarea 4.1: Gráfico de batería
- [ ] `BatteryChart.jsx` - Gráfico con Recharts
  - Tendencia de 24 horas
  - Puntos de datos cada 30min
  - Tooltip con detalles
  - Rango de fechas seleccionable

#### Tarea 4.2: Panel de eventos
- [ ] `EventLog.jsx` - Historial de eventos
  - Lista scrolleable de eventos
  - Filtros por tipo
  - Búsqueda por texto
  - Paginación
  - Timestamp y detalles

---

### **ITERACIÓN 5: FRONTEND - Gestión de Programas (2-3 días)**

#### Tarea 5.1: Gestor de programas
- [ ] `ProgramManager.jsx` - Gestión de programas
  - Lista de programas disponibles
  - Programa actual destacado
  - Botones de cambio
  - Crear personalizado (P2)

#### Tarea 5.2: Integración con API
- [ ] Conectar con `/api/v1/devices/:id/programs`
- [ ] Implementar cambio de programa
- [ ] Feedback visual de cambio en progreso

---

### **ITERACIÓN 6: INTEGRACIÓN - WebSocket Frontend (2-3 días)**

#### Tarea 6.1: Cliente Socket.io
- [ ] Conectar con servidor WebSocket
- [ ] Suscribirse a canales del dispositivo
- [ ] Manejo de reconexión automática

#### Tarea 6.2: Actualización en tiempo real
- [ ] Actualizar batería sin recargar
- [ ] Listar nuevos eventos automáticamente
- [ ] Indicadores visuales de actualización

---

### **ITERACIÓN 7: PULIDO Y PRUEBAS (3-4 días)**

#### Tarea 7.1: Pruebas funcionales
- [ ] [ ] Dashboard carga en < 1s
- [ ] [ ] Batería actualiza cada 30s
- [ ] [ ] Programa cambia en < 1s
- [ ] [ ] Eventos se registran automáticamente
- [ ] [ ] WebSocket conecta y reconecta

#### Tarea 7.2: Optimización
- [ ] Lazy loading de componentes
- [ ] Memoización de componentes React
- [ ] Optimizar re-renders
- [ ] Reducir tamaño de bundles

#### Tarea 7.3: Pulido UI/UX
- [ ] Animaciones suaves
- [ ] Estados de carga
- [ ] Manejo de errores
- [ ] Mensajes de usuario claros

---

## 📊 ESTRUCTURA DE ARCHIVOS

```
backend/
├── data/
│   ├── battery-history.json
│   ├── events.json
│   └── device-state.json
├── src/
│   ├── services/
│   │   ├── battery-history.js (NEW)
│   │   ├── event-logger.js (NEW)
│   │   └── program-manager.js (UPDATED)
│   └── routes/
│       ├── battery.js (NEW)
│       ├── events.js (NEW)
│       └── programs.js (NEW)
└── src/websocket/ (NEW)
    └── handlers.js

desktop/src/
├── components/
│   ├── Dashboard.jsx (NEW)
│   ├── RealtimeMonitor.jsx (NEW)
│   ├── DeviceCard.jsx (NEW)
│   ├── BatteryChart.jsx (NEW)
│   ├── ProgramManager.jsx (NEW)
│   ├── EventLog.jsx (NEW)
│   └── AlertPanel.jsx (NEW)
└── hooks/
    ├── useDeviceStatus.js (NEW)
    ├── useBatteryHistory.js (NEW)
    └── useWebSocket.js (NEW)
```

---

## 🔌 ENDPOINTS A IMPLEMENTAR

### Battery Endpoints
```
GET    /api/v1/devices/:id/battery/history
GET    /api/v1/devices/:id/battery/history?days=7
POST   /api/v1/devices/:id/battery/record
GET    /api/v1/devices/:id/battery/stats
```

### Event Endpoints
```
GET    /api/v1/devices/:id/events
GET    /api/v1/devices/:id/events?type=battery
GET    /api/v1/devices/:id/events?search=text
POST   /api/v1/devices/:id/events
DELETE /api/v1/devices/:id/events/:eventId
POST   /api/v1/devices/:id/events/export
```

### Program Endpoints
```
GET    /api/v1/devices/:id/programs
POST   /api/v1/devices/:id/programs/:programId/switch
POST   /api/v1/devices/:id/programs
PUT    /api/v1/devices/:id/programs/:programId
DELETE /api/v1/devices/:id/programs/:programId
```

### WebSocket Events
```
ws://localhost:3000/ws
Events:
  - device:battery:update
  - device:event:new
  - device:status:change
  - device:connected
  - device:disconnected
```

---

## 📈 MÉTRICAS DE ÉXITO

- [ ] Dashboard carga en < 1 segundo
- [ ] Batería se actualiza cada 30 segundos (en vivo)
- [ ] Cambiar programa toma < 1 segundo
- [ ] Todos los eventos del usuario registrados
- [ ] WebSocket mantiene conexión 1+ hora
- [ ] Cero errores en consola
- [ ] Responsive en móvil/tablet/desktop
- [ ] 20+ casos de prueba pasan

---

## 🗓️ CRONOGRAMA ESTIMADO

| Semana | Iteraciones | Hitos |
|--------|-------------|-------|
| **Semana 1** | 1-2 | Backend completo, WebSocket funcional |
| **Semana 2** | 3-4 | Dashboard, Gráficos, Programas |
| **Semana 3** | 5-6 | Integración WebSocket, Pruebas |
| **Semana 4** | 7 | Pulido, Optimización, Deployment |

---

## 🚀 PRÓXIMO PASO

**Comenzar Iteración 1:** Crear sistema de almacenamiento JSON y endpoints de historial

**Commit inicial:** `Fase 2 Start - Backend structure and storage`

---

**Estado:** 📋 PLAN LISTO PARA IMPLEMENTAR
