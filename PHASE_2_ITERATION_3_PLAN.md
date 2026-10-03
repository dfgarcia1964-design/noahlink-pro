# FASE 2 - ITERACIÓN 3: PLAN DETALLADO

**Objetivo:** Crear componentes React para el dashboard en tiempo real

**Duración Estimada:** 3-4 días  
**Prioridad:** P0 (Esencial)

---

## 🎯 COMPONENTES A CONSTRUIR

### 1. **Dashboard.jsx** (Principal)
**Descripción:** Contenedor principal de la aplicación

**Features:**
- Header con título y opciones
- Grid layout de 2 columnas (Dispositivos + Monitores)
- Responsive (mobile/tablet/desktop)
- Barra lateral con navegación
- Themes claro/oscuro

**Props:** `devices`, `loading`, `error`

**State:**
- `selectedDevice` - Dispositivo actual
- `activeTab` - Pestaña actual
- `darkMode` - Tema

**Estructura:**
```
Dashboard
├── Header
├── Sidebar
├── MainContainer
│   ├── DeviceList (col-1)
│   │   └── DeviceCard[] (multiple)
│   └── MonitorPanel (col-2)
│       ├── RealtimeMonitor
│       ├── BatteryChart
│       └── EventLog
└── Footer
```

---

### 2. **DeviceCard.jsx** (Tarjeta)
**Descripción:** Tarjeta individual de dispositivo

**Features:**
- Nombre y modelo del dispositivo
- Indicador de conexión (verde/rojo)
- Icono del estado
- Nivel de batería visual
- Programa actual
- Click para seleccionar

**Props:**
```javascript
{
  device: {
    id, name, model, battery, connected, currentProgram
  },
  isSelected: boolean,
  onClick: function
}
```

**Styles:**
- Shadow y border en hover
- Color de batería cambia por nivel
- Indicador de conexión animado

---

### 3. **RealtimeMonitor.jsx** (Monitor en Vivo)
**Descripción:** Muestra métricas en vivo del dispositivo

**Sections:**
- **Batería:** Número grande + barra de progreso + estado
- **Volumen:** Control deslizable + % visible
- **Programa:** Nombre actual + botón de cambio
- **Señal:** Indicador de RSSI
- **Último Sync:** Timestamp

**Features:**
- WebSocket real-time updates
- Indicadores visuales de cambio (flash brief)
- Unidades: % (batería), % (volumen), dBm (RSSI)

**Props:**
```javascript
{
  device: object,
  onVolumeChange: function,
  onProgramChange: function
}
```

---

### 4. **BatteryChart.jsx** (Gráfico)
**Descripción:** Gráfico de tendencias de batería con Recharts

**Features:**
- LineChart de 24 horas
- Puntos de datos cada 30 minutos
- Tooltip con detalles
- X-axis: Tiempo
- Y-axis: Porcentaje batería
- Color dinámico (verde/amarillo/rojo)
- Selector de rango (24h, 7d, 30d)

**Props:**
```javascript
{
  deviceId: string,
  data: array,
  timeRange: '24h' | '7d' | '30d'
}
```

**Datos esperados:**
```javascript
[
  { timestamp: "2026-10-03T08:00:00Z", level: 100 },
  { timestamp: "2026-10-03T08:30:00Z", level: 95 },
  ...
]
```

---

### 5. **EventLog.jsx** (Historial)
**Descripción:** Lista de eventos con filtrado

**Features:**
- Lista scrolleable de eventos
- Ordenados por reciente primero
- Colores por tipo (azul/amarillo/rojo)
- Filtros:
  - Por tipo (battery, program_switch, volume, etc)
  - Por severidad (info, warning, critical)
  - Búsqueda por texto
- Paginación (20 eventos por página)
- Timestamp formateado

**Props:**
```javascript
{
  deviceId: string,
  events: array,
  loading: boolean,
  onFilter: function
}
```

**Evento ejemplo:**
```javascript
{
  id: "evt-001",
  timestamp: "2026-10-03T08:15:00Z",
  type: "program_switch",
  severity: "info",
  title: "Programa cambiado",
  message: "Cambió de 'Conversación' a 'Aire Libre'"
}
```

---

### 6. **ProgramManager.jsx** (Programas)
**Descripción:** Gestor de programas de audio

**Features:**
- Lista de programas disponibles
- Programa actual destacado (selected state)
- Botón de cambio con loading
- Descripción del programa
- Icono representativo
- Grid layout (3 columnas)

**Props:**
```javascript
{
  programs: array,
  currentProgram: string,
  onProgramChange: function,
  loading: boolean
}
```

**Programa ejemplo:**
```javascript
{
  id: "speech",
  name: "Conversación",
  icon: "👥",
  description: "Optimizado para conversación",
  category: "standard"
}
```

---

## 🪝 CUSTOM HOOKS A CREAR

### 1. **useDeviceStatus.js**
Gestiona estado del dispositivo

```javascript
const { device, loading, error, updateVolume } = useDeviceStatus(deviceId);
```

Features:
- Conecta con WebSocket
- Suscribe a `device:${deviceId}`
- Actualiza en tiempo real
- Manejo de errores

---

### 2. **useBatteryHistory.js**
Obtiene historial de batería

```javascript
const { data, loading, error } = useBatteryHistory(deviceId, timeRange);
```

Features:
- Llamada GET a `/api/v1/devices/:deviceId/battery/history`
- Cachea resultados
- Refetch manual

---

### 3. **useEventLog.js**
Obtiene eventos del dispositivo

```javascript
const { events, loading, error, filter, search } = useEventLog(deviceId);
```

Features:
- Obtiene eventos con paginación
- Filtros y búsqueda
- Refetch automático cada 30s

---

### 4. **useWebSocket.js**
Maneja conexión WebSocket

```javascript
const { connected, subscribe, unsubscribe, on } = useWebSocket();
```

Features:
- Conecta a servidor WebSocket
- Suscripción a dispositivos
- Event listeners
- Reconnexión automática

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
desktop/src/
├── components/
│   ├── Dashboard.jsx           (NEW - 250 lines)
│   ├── DeviceCard.jsx          (NEW - 120 lines)
│   ├── RealtimeMonitor.jsx     (NEW - 200 lines)
│   ├── BatteryChart.jsx        (NEW - 180 lines)
│   ├── EventLog.jsx            (NEW - 220 lines)
│   └── ProgramManager.jsx      (NEW - 180 lines)
├── hooks/
│   ├── useDeviceStatus.js      (NEW - 80 lines)
│   ├── useBatteryHistory.js    (NEW - 60 lines)
│   ├── useEventLog.js          (NEW - 70 lines)
│   └── useWebSocket.js         (NEW - 100 lines)
├── styles/
│   └── components.css          (NEW - 300 lines)
├── utils/
│   ├── formatters.js           (NEW - 50 lines)
│   └── constants.js            (NEW - 40 lines)
└── App.jsx                     (UPDATED)
```

---

## 🎨 DISEÑO & STYLING

**Framework:** CSS Modules + Tailwind (si disponible)

**Color Palette:**
- Primario: #2563eb (Azul)
- Secundario: #64748b (Gris)
- Éxito: #22c55e (Verde)
- Alerta: #f59e0b (Amarillo)
- Error: #ef4444 (Rojo)

**Responsive:**
- Mobile: < 768px (1 columna)
- Tablet: 768px - 1024px (2 columnas)
- Desktop: > 1024px (2+ columnas)

**Animaciones:**
- Transiciones suaves (200ms)
- Battery update flash (100ms)
- Hover effects en cards
- Loading spinners

---

## 📊 DATA FLOW

```
Backend (WebSocket)
    ↓
useWebSocket hook
    ↓
useDeviceStatus + useBatteryHistory + useEventLog
    ↓
Redux / Context (opcional)
    ↓
Components (Props down, Events up)
    ├── Dashboard
    │   ├── DeviceCard (per device)
    │   ├── RealtimeMonitor
    │   ├── BatteryChart
    │   ├── EventLog
    │   └── ProgramManager
    └── UI Rendering
```

---

## 🧪 TESTING CHECKLIST

- [ ] Dashboard renders sin errores
- [ ] DeviceCard selecciona dispositivo
- [ ] RealtimeMonitor actualiza en tiempo real
- [ ] BatteryChart dibuja datos correctamente
- [ ] EventLog filtra por tipo
- [ ] ProgramManager cambia programa
- [ ] WebSocket conecta y desconecta
- [ ] Responsive en mobile/tablet/desktop
- [ ] Sin console errors/warnings

---

## 📈 MÉTRICAS DE ÉXITO

- ✅ Dashboard carga en < 1 segundo
- ✅ Actualizaciones WebSocket < 500ms
- ✅ Gráfico dibuja en < 500ms
- ✅ Sin memory leaks
- ✅ 0 console errors
- ✅ Responsive en 3 breakpoints
- ✅ 6/6 componentes completados

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

1. **Crear hooks básicos** (useWebSocket, useDeviceStatus)
2. **DeviceCard** - Componente simple, sin dependencias
3. **RealtimeMonitor** - Usa deviceStatus hook
4. **BatteryChart** - Usa batteryHistory hook, Recharts
5. **EventLog** - Usa eventLog hook, más complejo
6. **ProgramManager** - Usa deviceStatus hook
7. **Dashboard** - Integra todo
8. **Styling & Responsiveness**
9. **Pruebas & Optimización**

---

**Estado:** 📋 PLAN LISTO PARA IMPLEMENTAR
