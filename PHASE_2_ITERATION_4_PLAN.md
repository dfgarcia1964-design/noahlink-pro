# FASE 2 - ITERACIÓN 4: PLAN DETALLADO

**Objetivo:** Gráficos avanzados, analytics y predicciones

**Duración Estimada:** 3-4 días  
**Prioridad:** P0 (Esencial)

---

## 🎯 FUNCIONALIDADES A CONSTRUIR

### 1. **UsageStatsHook.js** (120 líneas)
Hook para obtener estadísticas de uso

```javascript
const { stats, loading } = useUsageStats(deviceId, timeRange);

Returns:
{
  totalUsageHours: 24.5,
  averageSessionLength: 1.5,
  activeSessions: 3,
  sessionsPerDay: 2.1,
  programUsage: {
    conversation: 45,
    outdoor: 30,
    quiet: 15,
    music: 10
  },
  volumeStats: {
    average: 65,
    min: 20,
    max: 100
  }
}
```

---

### 2. **UsageAnalytics.jsx** (220 líneas)
Dashboard de analytics de uso

**Sections:**
- Total usage (días, horas)
- Program distribution (pie chart)
- Volume trends (área chart)
- Session distribution (bar chart)
- Top programs (lista)
- Usage alerts

---

### 3. **BatteryPrediction.jsx** (180 líneas)
Predicción avanzada de batería

**Features:**
- Estimación de horas restantes
- Proyección para próximas 24h (área chart)
- Recomendaciones (cargar si < 20%)
- Histórico de predicciones
- Precisión del modelo (%)

---

### 4. **DeviceAnalyticsDetail.jsx** (250 líneas)
Página de análisis detallado por dispositivo

**Sections:**
- Selector de rango (7d, 30d, 90d)
- Comparativa: Batería vs Uso
- Correlación: Volumen → Batería
- Events timeline (eje X: tiempo, puntos: eventos)
- Export analytics (CSV, PDF)

---

### 5. **ComparisonWidget.jsx** (150 líneas)
Comparación entre dispositivos

**Features:**
- Selector múltiple de dispositivos
- Gráfico comparativo de batería
- Tabla de estadísticas
- Diferencias destacadas
- Promedio del grupo

---

### 6. **AlertsPanel.jsx** (140 líneas)
Panel de alertas y notificaciones

**Alerts:**
- Batería baja (< 20%)
- Dispositivo desconectado (> 5 min)
- Eventos críticos
- Cambios anormales en consumo

**Actions:**
- Dismiss alert
- Set reminder
- Configure threshold

---

### 7. **ReportsGenerator.jsx** (200 líneas)
Generador de reportes

**Report Types:**
- Weekly Summary
- Monthly Analytics
- Battery Health Report
- Usage Trends
- Device Comparison

**Formats:**
- PDF export
- CSV export
- Email scheduling

---

## 🪝 HOOKS ADICIONALES

### useUsageStats.js (120 líneas)
```javascript
const { stats, loading, error } = useUsageStats(deviceId, timeRange);
```

Obtiene:
- Total usage hours
- Session count
- Program distribution
- Volume statistics
- Time of day patterns

---

### useBatteryPrediction.js (100 líneas)
```javascript
const { prediction, trend, accuracy } = useBatteryPrediction(deviceId);
```

Retorna:
- Hours remaining
- Projection data points
- Model accuracy
- Confidence interval

---

### useAnalyticsData.js (150 líneas)
```javascript
const { data, loading, compareDevices } = useAnalyticsData(deviceIds, timeRange);
```

Agregador de datos para comparaciones

---

## 📊 NUEVAS RUTAS BACKEND

```
GET /api/v1/devices/:deviceId/analytics/usage
├─ Query: ?days=7 (7, 30, 90, 365)
└─ Returns: {totalHours, sessions, programs, volumes}

GET /api/v1/devices/:deviceId/analytics/prediction
├─ Returns: {hoursRemaining, projection[], accuracy}

GET /api/v1/devices/:deviceId/analytics/daily-stats
├─ Query: ?date=2026-10-03
└─ Returns: {sessions, programs, events, battery}

GET /api/v1/devices/:deviceId/analytics/compare
├─ Query: ?devices=dev1,dev2,dev3
└─ Returns: [{deviceId, stats, comparison}]

GET /api/v1/devices/:deviceId/analytics/events-timeline
├─ Query: ?days=7
└─ Returns: [{timestamp, event, severity}]

POST /api/v1/devices/:deviceId/analytics/export
├─ Body: {format: 'pdf|csv', type: 'summary|detailed'}
└─ Returns: File download
```

---

## 📈 NUEVOS SERVICIOS BACKEND

### analyticsService.js (300 líneas)
```javascript
calculateUsageStats(deviceId, days)
calculateBatteryPrediction(deviceId)
getSessionAnalytics(deviceId, date)
generateComparison(deviceIds)
exportAnalyticsReport(deviceId, format)
detectAnomalies(deviceId, timeRange)
```

---

## 🎨 COMPONENTES VISUALES

### Gráficos Necesarios (Recharts)
- PieChart (program distribution)
- AreaChart (volume trends, battery projection)
- BarChart (sessions per day, program usage)
- LineChart (usage over time)
- ComposedChart (battery vs usage correlation)
- ScatterChart (anomaly detection)

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
desktop/src/
├── hooks/
│   ├── useUsageStats.js        (NEW - 120 lines)
│   ├── useBatteryPrediction.js (NEW - 100 lines)
│   └── useAnalyticsData.js     (NEW - 150 lines)
├── components/
│   ├── UsageAnalytics.jsx      (NEW - 220 lines)
│   ├── BatteryPrediction.jsx   (NEW - 180 lines)
│   ├── DeviceAnalyticsDetail.jsx (NEW - 250 lines)
│   ├── ComparisonWidget.jsx    (NEW - 150 lines)
│   ├── AlertsPanel.jsx         (NEW - 140 lines)
│   ├── ReportsGenerator.jsx    (NEW - 200 lines)
│   └── Dashboard.jsx           (UPDATED - add analytics tab)
└── utils/
    ├── chartConfigs.js         (NEW - chart presets)
    └── analyticsUtils.js       (NEW - calculations)

backend/src/
├── services/
│   └── analytics-service.js    (NEW - 300 lines)
├── routes/
│   └── analytics.js            (NEW - 280 lines)
└── data/
    └── analytics-cache.json    (NEW - cached analytics)
```

---

## ✅ TESTING CHECKLIST

- [ ] useUsageStats hook fetches data
- [ ] useBatteryPrediction calculates correctly
- [ ] UsageAnalytics renders pie chart
- [ ] BatteryPrediction shows projection
- [ ] DeviceAnalyticsDetail loads all sections
- [ ] ComparisonWidget compares multiple devices
- [ ] AlertsPanel displays alerts
- [ ] ReportsGenerator creates exports
- [ ] All charts render smoothly
- [ ] Analytics tab integration in Dashboard
- [ ] No console errors
- [ ] Performance < 1 second

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

1. Backend services: analyticsService.js, analytics routes
2. Hooks: useUsageStats, useBatteryPrediction, useAnalyticsData
3. Componentes simples: AlertsPanel, ComparisonWidget
4. Componentes complejos: UsageAnalytics, BatteryPrediction
5. Página detallada: DeviceAnalyticsDetail
6. Reportes: ReportsGenerator
7. Integración en Dashboard
8. Tests y optimización

---

## 📊 ESTADÍSTICAS ESPERADAS

| Métrica | Valor |
|---------|-------|
| Componentes Nuevos | 6 |
| Hooks Nuevos | 3 |
| Líneas de Código | 1,600+ |
| Gráficos Nuevos | 6+ |
| Rutas Backend | 5 |
| Tiempo Estimado | 3-4 horas |

---

**Estado:** 📋 PLAN LISTO PARA IMPLEMENTAR

