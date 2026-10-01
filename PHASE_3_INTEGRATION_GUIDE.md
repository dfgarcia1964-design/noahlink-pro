# 🔗 Phase 3 - Guía de Integración

## Componentes Creados en Phase 3

Se han creado **6 componentes nuevos** listos para integrar en el Dashboard:

```
1. ProgramEditor.jsx       - Editor de programas avanzado
2. AdvancedAnalytics.jsx   - Análisis predictivo de batería
3. UserProfiles.jsx        - Gestión de perfiles
4. Settings.jsx            - Configuración avanzada
5. DarkModeToggle.jsx      - Control de tema
6. AlertsCenter.jsx        - Centro de alertas
```

---

## 📝 Paso 1: Importar Componentes en Dashboard.jsx

```jsx
// En la parte superior de dashboard.jsx, agregar:

import ProgramEditor from './ProgramEditor';
import AdvancedAnalytics from './AdvancedAnalytics';
import UserProfiles from './UserProfiles';
import Settings from './Settings';
import DarkModeToggle from './DarkModeToggle';
import AlertsCenter from './AlertsCenter';
```

---

## 🔄 Paso 2: Extender el State

```jsx
const [activeTab, setActiveTab] = useState('resumen');
const [darkMode, setDarkMode] = useState(false);

// Agregar más tabs:
const tabs = [
  { id: 'resumen', label: '📊 Resumen', icon: '📊' },
  { id: 'bateria', label: '🔋 Batería', icon: '🔋' },
  { id: 'programas', label: '🎵 Programas', icon: '🎵' },
  { id: 'eventos', label: '📋 Eventos', icon: '📋' },
  
  // NUEVAS TABS PHASE 3:
  { id: 'editor', label: '✎ Editor', icon: '✎' },
  { id: 'analytics', label: '📈 Análisis', icon: '📈' },
  { id: 'perfiles', label: '👤 Perfiles', icon: '👤' },
  { id: 'alertas', label: '🔔 Alertas', icon: '🔔' },
  { id: 'configuracion', label: '⚙️ Configuración', icon: '⚙️' },
];
```

---

## 🎨 Paso 3: Agregar Tab Navigation

```jsx
<div className="dashboard-tabs">
  {tabs.map(tab => (
    <button
      key={tab.id}
      className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
      onClick={() => setActiveTab(tab.id)}
    >
      <span className="tab-icon">{tab.icon}</span>
      <span className="tab-label">{tab.label}</span>
    </button>
  ))}
</div>
```

---

## 📱 Paso 4: Integrar Componentes en Tab Panels

```jsx
{/* NUEVOS PANELES PHASE 3 */}

{activeTab === 'editor' && (
  <div className="tab-panel active">
    <ProgramEditor onSave={(program) => {
      console.log('Programa guardado:', program);
    }} />
  </div>
)}

{activeTab === 'analytics' && (
  <div className="tab-panel active">
    <AdvancedAnalytics batteryHistory={batteryHistory} />
  </div>
)}

{activeTab === 'perfiles' && (
  <div className="tab-panel active">
    <UserProfiles />
  </div>
)}

{activeTab === 'alertas' && (
  <div className="tab-panel active">
    <AlertsCenter />
  </div>
)}

{activeTab === 'configuracion' && (
  <div className="tab-panel active">
    <Settings onDarkModeChange={setDarkMode} />
  </div>
)}
```

---

## 🎨 Paso 5: Agregar DarkModeToggle en Header

```jsx
<div className="dashboard-header">
  <h1>📱 NoahLink Pro Dashboard</h1>
  <div className="header-controls">
    <DarkModeToggle onToggle={setDarkMode} />
    {/* otros controles */}
  </div>
</div>
```

---

## 🎯 Paso 6: Actualizar CSS del Dashboard

Agregar estilos responsivos para las nuevas tabs:

```css
.dashboard-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
}

.tab-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  transition: all 0.3s;
}

.tab-button.active {
  color: #667eea;
  border-bottom: 3px solid #667eea;
}

.tab-icon {
  font-size: 18px;
}

.tab-label {
  font-weight: 600;
  font-size: 11px;
}
```

---

## 🧪 Paso 7: Testing de Componentes

### UserProfiles Testing
```javascript
// Verificar que se pueden crear nuevos perfiles
// Verificar que se puede cambiar el perfil activo
// Verificar que se pueden eliminar perfiles
// Verificar que muestra estadísticas correctas
```

### Settings Testing
```javascript
// Verificar que los toggles funcionan
// Verificar que localStorage persiste los datos
// Verificar que el darkMode se aplica
// Verificar que los sliders funcionan (batería, frecuencia)
```

### AlertsCenter Testing
```javascript
// Verificar que el filtrado funciona
// Verificar que el ordenamiento funciona
// Verificar que se pueden marcar alertas como leídas
// Verificar que se pueden eliminar alertas
```

### DarkModeToggle Testing
```javascript
// Verificar que el icono cambia
// Verificar que se persiste en localStorage
// Verificar que el data-theme se actualiza
```

---

## 📊 Paso 8: Integración de Datos

```jsx
// Pasar batteryHistory al AdvancedAnalytics:
const [batteryHistory, setBatteryHistory] = useState([
  { timestamp: '2026-10-01 08:00', level: 95 },
  { timestamp: '2026-10-01 09:00', level: 90 },
  // ... más datos
]);

// Pasar notificaciones al AlertsCenter:
const [alerts, setAlerts] = useState([
  // alertas iniciales
]);
```

---

## 🚀 Fase de Integración Rápida (Checklist)

- [ ] Importar los 6 componentes en Dashboard.jsx
- [ ] Extender el estado con nuevas tabs
- [ ] Agregar botones de navegación para tabs
- [ ] Implementar tab panels para cada componente
- [ ] Agregar DarkModeToggle en header
- [ ] Actualizar CSS del Dashboard
- [ ] Verificar responsividad en móvil
- [ ] Probar interacciones de cada componente
- [ ] Verificar dark mode funciona en todos lados
- [ ] Testing manual completo

---

## 💾 Orden de Importancia

**Crítico (implementar primero):**
1. ✅ ProgramEditor
2. ✅ AdvancedAnalytics
3. ✅ AlertsCenter

**Importante (después):**
4. ✅ UserProfiles
5. ✅ Settings

**Complementario:**
6. ✅ DarkModeToggle

---

## 📈 Próximas Tareas After Integration

1. **Backend APIs Phase 3**
   - POST /api/v1/programs/custom
   - PUT /api/v1/programs/:id
   - GET /api/v1/analytics/trends
   - POST /api/v1/profiles
   - PUT /api/v1/settings

2. **Database Integration**
   - MongoDB connection
   - User profiles schema
   - Program customization schema
   - Alert history schema

3. **Real-time Updates**
   - WebSocket para alerts
   - Live analytics updates
   - Profile sync

4. **Testing Completo**
   - Unit tests para cada componente
   - Integration tests
   - E2E tests con Cypress

---

## 📞 Troubleshooting

**Si los tabs no se muestran:**
- Verificar que el CSS de `.tab-panel` tiene `display: flex` o `display: block`
- Verificar que `activeTab` se actualiza correctamente
- Agregar `!important` a las reglas CSS si es necesario

**Si DarkMode no funciona:**
- Verificar que `document.documentElement` acepta `data-theme`
- Verificar que localStorage está disponible
- Revisar la consola del navegador para errores

**Si los componentes no se ven:**
- Verificar que los imports están correctos
- Verificar que los archivos CSS están en la ruta correcta
- Verificar que no hay errores en la consola del navegador

---

**¡Fase 3 lista para integración! 🎉**
