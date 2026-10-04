import React, { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import RealtimeMonitor from './RealtimeMonitor';
import BatteryChartDemo from './BatteryChartDemo';
import EventLogDemo from './EventLogDemo';
import ProgramManagerDemo from './ProgramManagerDemo';

const Dashboard = ({ devices = [], loading = false, error = null, userId = 'user-001', onUpdateVolume, onUpdateProgram, getDeviceEvents }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [activeTab, setActiveTab] = useState('monitor');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0].id);
    }
  }, [devices, selectedDevice]);

  const currentDevice = devices.find((d) => d.id === selectedDevice);

  const tabs = [
    { id: 'monitor', label: 'Monitor en Vivo', icon: '📊' },
    { id: 'battery', label: 'Batería', icon: '🔋' },
    { id: 'events', label: 'Eventos', icon: '📝' },
    { id: 'programs', label: 'Programas', icon: '🎵' }
  ];

  const bgColor = darkMode ? '#1f2937' : '#f3f4f6';
  const textColor = darkMode ? '#ffffff' : '#1f2937';
  const cardBg = darkMode ? '#374151' : '#ffffff';

  const headerStyle = {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '20px 24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  };

  const mainStyle = {
    minHeight: '100vh',
    backgroundColor: bgColor,
    color: textColor,
    transition: 'background-color 0.3s, color 0.3s'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: devices.length > 0 ? '300px 1fr' : '1fr',
    gap: '24px'
  };

  return (
    <div style={mainStyle}>
      <div style={headerStyle}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0', fontSize: '28px', fontWeight: '700' }}>
                🎧 NoahLink Pro Dashboard
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                Control en tiempo real de tus dispositivos Phonak
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            marginBottom: '20px',
            fontWeight: '500'
          }}>
            Error: {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px' }}>
            Cargando dispositivos...
          </div>
        )}

        <div style={gridStyle}>
          {devices.length > 0 && (
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>
                Mis Dispositivos ({devices.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {devices.map((device) => (
                  <div key={device.id} onClick={() => setSelectedDevice(device.id)}>
                    <DeviceCard
                      device={device}
                      isSelected={selectedDevice === device.id}
                      onClick={() => setSelectedDevice(device.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            {currentDevice ? (
              <div>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>
                  {currentDevice.name} Panel de Control
                </h2>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '20px',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: activeTab === tab.id ? '#2563eb' : 'transparent',
                        color: activeTab === tab.id ? '#ffffff' : textColor,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                <div>
                  {activeTab === 'monitor' && (
                    <RealtimeMonitor device={currentDevice} userId={userId} onUpdateVolume={onUpdateVolume} />
                  )}
                  {activeTab === 'battery' && (
                    <BatteryChartDemo device={currentDevice} />
                  )}
                  {activeTab === 'events' && (
                    <EventLogDemo device={currentDevice} getDeviceEvents={getDeviceEvents} />
                  )}
                  {activeTab === 'programs' && (
                    <ProgramManagerDemo device={currentDevice} onUpdateProgram={onUpdateProgram} />
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: cardBg,
                borderRadius: '8px'
              }}>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>
                  {devices.length === 0 ? 'No hay dispositivos' : 'Selecciona un dispositivo'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: cardBg,
        borderTop: '1px solid #e5e7eb',
        padding: '20px 24px',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '12px',
        marginTop: '40px'
      }}>
        <p>NoahLink Pro v1.0 - Datos en tiempo real</p>
      </div>
    </div>
  );
};

export default Dashboard;
