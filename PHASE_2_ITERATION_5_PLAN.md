# FASE 2 - ITERACIÓN 5: PLAN DETALLADO

**Objetivo:** Editor avanzado de programas con presets y sincronización

**Duración Estimada:** 3-4 días  
**Prioridad:** P0 (Esencial)

---

## 🎯 FUNCIONALIDADES A CONSTRUIR

### 1. **ProgramEditor.jsx** (280 líneas)
Editor visual de programas con controles deslizantes

**Features:**
- Nombre del programa editable
- 5 controles deslizables:
  - Ganancia baja frecuencia (0-12 dB)
  - Ganancia media frecuencia (0-12 dB)
  - Ganancia alta frecuencia (0-12 dB)
  - Compresión (1-4 ratio)
  - Ruido (0-100%)
- Vista previa en tiempo real
- Guardar cambios
- Descartar
- Clonar programa

**Props:**
```javascript
{
  program: {
    id, name, icon, settings: {
      lowFreq, midFreq, highFreq, compression, noise
    }
  },
  onSave: function,
  onCancel: function
}
```

---

### 2. **ProgramPresets.jsx** (220 líneas)
Gestor de presets predefinidos

**Presets Incluidos:**
- Conversación (optimizado para voz)
- Aire Libre (reducción de ruido)
- Silencio (amplificación mínima)
- Música (respuesta equilibrada)
- Telefonía (énfasis en voz)
- Personalizado (vacío)

**Features:**
- Grid de 3 columnas
- Aplicar preset con un click
- Mostrar configuración al hover
- Descripciones
- Etiquetas de categoría

---

### 3. **ProgramLibrary.jsx** (250 líneas)
Biblioteca de programas guardados

**Sections:**
- Búsqueda por nombre
- Filtro por categoría
- Ordenar por: Reciente, Nombre, Uso
- Tabla con columnas: Nombre, Categoría, Último Uso, Acciones
- Acciones: Editar, Clonar, Eliminar, Exportar, Aplicar
- Importar programa (JSON)

**Features:**
- Drag-drop para reordenar
- Selección múltiple
- Borrado en lote
- Búsqueda en tiempo real
- Paginación (10 programas por página)

---

### 4. **SyncSettings.jsx** (180 líneas)
Sincronización multi-dispositivo

**Features:**
- Selector de dispositivos destino
- Opciones de sincronización:
  - Sincronizar todos los programas
  - Seleccionar programas específicos
  - Sobrescribir vs Fusionar
- Estado de sincronización (En progreso, Completado, Error)
- Historial de sincronizaciones (últimas 5)
- Botón de sincronizar

**Props:**
```javascript
{
  sourceDevice: id,
  programs: [],
  onSync: function,
  devices: []
}
```

---

### 5. **FrequencyVisualizer.jsx** (150 líneas)
Visualización de curva de respuesta de frecuencias

**Features:**
- Gráfico de línea con Recharts
- Eje X: Frecuencia (Hz: 100-8000)
- Eje Y: Ganancia (dB: 0-12)
- Línea de curva suave
- Tooltip con valores exactos
- Comparación visual con preset base
- Leyenda de frecuencias

---

### 6. **ProgramStats.jsx** (120 líneas)
Estadísticas de uso de programas

**Stats:**
- Programa más usado
- Cambios hoy
- Cambios esta semana
- Tiempo promedio por programa
- Gráfico de tendencias (bar chart)
- Top 3 programas

---

### 7. **ProgramImportExport.jsx** (140 líneas)
Importar/Exportar programas

**Features:**
- Exportar programa individual como JSON
- Exportar todos como ZIP
- Importar desde JSON
- Importar batch
- Validación de formato
- Confirmación antes de sobrescribir
- Historial de importaciones/exportaciones

---

## 🪝 NUEVOS HOOKS

### useProgramEditor.js (160 líneas)
```javascript
const { program, updateSetting, save, cancel, isDirty } = useProgramEditor(initialProgram);
```

Gestiona estado del editor

### useProgramLibrary.js (180 líneas)
```javascript
const { programs, loading, search, filter, deleteProgram, importProgram } = useProgramLibrary(deviceId);
```

Gestiona biblioteca de programas

### useProgramSync.js (140 líneas)
```javascript
const { sync, loading, status, history } = useProgramSync(sourceDevice);
```

Gestiona sincronización

---

## 📊 NUEVAS RUTAS BACKEND

```
GET /api/v1/devices/:deviceId/programs
├─ Returns: [{id, name, icon, settings, category, createdAt, lastUsed}]

POST /api/v1/devices/:deviceId/programs
├─ Body: {name, icon, settings}
└─ Returns: {success, data: program}

PUT /api/v1/devices/:deviceId/programs/:programId
├─ Body: {name, settings}
└─ Returns: {success, data: program}

DELETE /api/v1/devices/:deviceId/programs/:programId
├─ Returns: {success}

POST /api/v1/devices/:deviceId/programs/sync
├─ Body: {sourcePrograms: [], targetDevices: [], mode: 'overwrite|merge'}
└─ Returns: {success, syncId, status}

GET /api/v1/devices/:deviceId/programs/presets
├─ Returns: [{id, name, description, settings, category}]

POST /api/v1/devices/:deviceId/programs/import
├─ Body: {programData: JSON, overwrite: boolean}
└─ Returns: {success, data: program}

GET /api/v1/devices/:deviceId/programs/export/:programId
├─ Returns: File download (JSON)
```

---

## 📈 NUEVOS SERVICIOS BACKEND

### programsService.js (350 líneas)
```javascript
createProgram(deviceId, programData)
updateProgram(deviceId, programId, updates)
deleteProgram(deviceId, programId)
getPrograms(deviceId, filter, sort)
getPresets()
syncPrograms(sourcePrograms, targetDevices, mode)
importProgram(deviceId, programData, overwrite)
exportProgram(deviceId, programId)
getProgramStats(deviceId, days)
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
desktop/src/
├── hooks/
│   ├── useProgramEditor.js     (NEW - 160 lines)
│   ├── useProgramLibrary.js    (NEW - 180 lines)
│   └── useProgramSync.js       (NEW - 140 lines)
├── components/
│   ├── ProgramEditor.jsx       (NEW - 280 lines)
│   ├── ProgramPresets.jsx      (NEW - 220 lines)
│   ├── ProgramLibrary.jsx      (NEW - 250 lines)
│   ├── SyncSettings.jsx        (NEW - 180 lines)
│   ├── FrequencyVisualizer.jsx (NEW - 150 lines)
│   ├── ProgramStats.jsx        (NEW - 120 lines)
│   └── ProgramImportExport.jsx (NEW - 140 lines)
└── utils/
    └── programDefaults.js      (NEW - 80 lines)

backend/src/
├── services/
│   └── programs-service.js     (NEW - 350 lines)
├── routes/
│   └── programs.js             (NEW - 320 lines)
└── data/
    └── programs.json           (NEW - sample presets)
```

---

## 🎨 DISEÑO & STYLING

**Colors:**
- Primario: #2563eb (Editor activo)
- Éxito: #22c55e (Guardado)
- Alerta: #f59e0b (Cambios sin guardar)
- Error: #ef4444 (Error)

**Responsive:**
- Mobile: Stack vertical
- Tablet: 2 columnas
- Desktop: 3 columnas (editor + library + stats)

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

1. Backend: programsService.js + programs.js routes
2. Hooks: useProgramEditor, useProgramLibrary, useProgramSync
3. Components simples: ProgramStats, FrequencyVisualizer
4. Components complejos: ProgramEditor, ProgramPresets
5. Library: ProgramLibrary.jsx
6. Sync: SyncSettings.jsx
7. Import/Export: ProgramImportExport.jsx
8. Integración en Dashboard
9. Tests y optimización

---

## 📊 ESTADÍSTICAS ESPERADAS

| Métrica | Valor |
|---------|-------|
| Componentes Nuevos | 7 |
| Hooks Nuevos | 3 |
| Líneas de Código | 1,800+ |
| Rutas Backend | 7 |
| Presets Incluidos | 6 |
| Tiempo Estimado | 3-4 horas |

---

**Estado:** 📋 PLAN LISTO PARA IMPLEMENTAR

