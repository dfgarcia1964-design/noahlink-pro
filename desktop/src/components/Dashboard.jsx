import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';
import DeviceCard from './DeviceCard';
import RealtimeMonitor from './RealtimeMonitor';
import BatteryChart from './BatteryChart';
import ProgramManager from './ProgramManager';
import EventLog from './EventLog';
import ProgramEditor from './ProgramEditor';
import AdvancedAnalytics from './AdvancedAnalytics';
import UserProfiles from './UserProfiles';
import Settings from './Settings';
import DarkModeToggle from './DarkModeToggle';
import AlertsCenter from './AlertsCenter';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [device, setDevice] = useState(null);
  const [batteryHistory, setBatteryHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [darkMode, setDarkMode] = useState(false);

  // Fetch device status on mount and setup polling
  useEffect(() => {
    const fetchDeviceStatus = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/devices');
        if (response.data.devices && response.data.devices.length > 0) {
          const connectedDevice = response.data.devices[0];
          setDevice(connectedDevice);
          setConnectionStatus('connected');

          // Simulate battery history (Phase 2: will be real data from backend)
          generateMockBatteryHistory(connectedDevice.id);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching device:', error);
        setConnectionStatus('error');
        setLoading(false);
      }
    };

    fetchDeviceStatus();

    // Poll device status every 30 seconds
    const interval = setInterval(fetchDeviceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate mock battery history for testing
  const generateMockBatteryHistory = (deviceId) => {
    const history = [];
    const now = Date.now();
    const oneHourMs = 60 * 60 * 1000;

    for (let i = 24; i >= 0; i--) {
      const timestamp = new Date(now - i * oneHourMs);
      const battery = Math.max(0, Math.min(100, 85 - (24 - i) * 3 + Math.random() * 10));

      history.push({
        timestamp: timestamp.toISOString(),
        level: Math.round(battery),
        deviceId: deviceId
      });
    }

    setBatteryHistory(history);
  };

  // Simulate events
  useEffect(() => {
    const mockEvents = [
      {
        id: 'evt-001',
        type: 'device_connected',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        message: 'Dispositivo conectado',
        severity: 'info'
      },
      {
        id: 'evt-002',
        type: 'volume_changed',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        message: 'Volumen cambiado a 75%',
        severity: 'info'
      },
      {
        id: 'evt-003',
        type: 'battery_low',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        message: 'Batería baja: 25%',
        severity: 'warning'
      }
    ];

    setEvents(mockEvents);
  }, []);

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="spinner">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>📊 Panel de Control</h1>
        <div className="header-controls">
          <DarkModeToggle onToggle={setDarkMode} />
          <div className={`status-indicator ${connectionStatus}`}>
            <span className="status-dot"></span>
            {connectionStatus === 'connected' && 'Conectado'}
            {connectionStatus === 'disconnected' && 'Desconectado'}
            {connectionStatus === 'error' && 'Error'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Resumen
        </button>
        <button
          className={`tab ${activeTab === 'battery' ? 'active' : ''}`}
          onClick={() => setActiveTab('battery')}
        >
          🔋 Batería
        </button>
        <button
          className={`tab ${activeTab === 'programs' ? 'active' : ''}`}
          onClick={() => setActiveTab('programs')}
        >
          🎵 Programas
        </button>
        <button
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          📋 Eventos
        </button>

        {/* PHASE 3 TABS */}
        <button
          className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          ✎ Editor
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Análisis
        </button>
        <button
          className={`tab ${activeTab === 'perfiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('perfiles')}
        >
          👤 Perfiles
        </button>
        <button
          className={`tab ${activeTab === 'alertas' ? 'active' : ''}`}
          onClick={() => setActiveTab('alertas')}
        >
          🔔 Alertas
        </button>
        <button
          className={`tab ${activeTab === 'configuracion' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuracion')}
        >
          ⚙️ Config
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-panel overview active">
            {device ? (
              <div className="grid-2col">
                <DeviceCard device={device} />
                <RealtimeMonitor device={device} batteryHistory={batteryHistory} />
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center' }}>Conectando...</div>
            )}
          </div>
        )}

        {/* Battery Tab */}
        {activeTab === 'battery' && (
          <div className="tab-panel battery">
            <h2>Historial de Batería</h2>
            {batteryHistory.length > 0 ? (
              <>
                <BatteryChart data={batteryHistory} />
                <div className="battery-stats">
                  <div className="stat">
                    <label>Nivel Actual:</label>
                    <span className="value">{batteryHistory[batteryHistory.length - 1]?.level || 0}%</span>
                  </div>
                  <div className="stat">
                    <label>Mínimo (24h):</label>
                    <span className="value">
                      {Math.min(...batteryHistory.map(h => h.level)) || 0}%
                    </span>
                  </div>
                  <div className="stat">
                    <label>Máximo (24h):</label>
                    <span className="value">
                      {Math.max(...batteryHistory.map(h => h.level)) || 0}%
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center' }}>Cargando historial de batería...</div>
            )}
          </div>
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div className="tab-panel programs">
            <h2>Gestión de Programas</h2>
            {device ? (
              <ProgramManager deviceId={device.id} />
            ) : (
              <div style={{ padding: '40px', textAlign: 'center' }}>Conecta un dispositivo primero</div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="tab-panel events">
            <h2>Historial de Eventos</h2>
            <EventLog events={events} />
          </div>
        )}

        {/* PHASE 3 TABS */}

        {/* Program Editor Tab */}
        {activeTab === 'editor' && (
          <div className="tab-panel editor active">
            <ProgramEditor onSave={(program) => {
              console.log('Programa guardado:', program);
              alert('✓ Programa guardado: ' + program.name);
            }} />
          </div>
        )}

        {/* Advanced Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="tab-panel analytics active">
            <AdvancedAnalytics batteryHistory={batteryHistory} />
          </div>
        )}

        {/* User Profiles Tab */}
        {activeTab === 'perfiles' && (
          <div className="tab-panel perfiles active">
            <UserProfiles />
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alertas' && (
          <div className="tab-panel alertas active">
            <AlertsCenter />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'configuracion' && (
          <div className="tab-panel configuracion active">
            <Settings onDarkModeChange={setDarkMode} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
