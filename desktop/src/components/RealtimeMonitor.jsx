import React, { useState } from 'react';
import useDeviceStatus from '../hooks/useDeviceStatus';

/**
 * RealtimeMonitor - Monitor en vivo del dispositivo
 * Muestra batería, volumen, programa, señal en tiempo real
 */
const RealtimeMonitor = ({ deviceId, userId = 'user-001' }) => {
  const { device, loading, connected, updateVolume, updateProgram } = useDeviceStatus(deviceId, userId);
  const [newVolume, setNewVolume] = useState(device?.volume || 0);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>;
  }

  if (!device) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Dispositivo no disponible</div>;
  }

  const handleVolumeChange = (e) => {
    const vol = parseInt(e.target.value);
    setNewVolume(vol);
    updateVolume(vol);
  };

  const getBatteryClass = (level) => {
    if (level >= 80) return 'Excelente';
    if (level >= 50) return 'Bueno';
    if (level >= 20) return 'Bajo';
    return 'Crítico';
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700' }}>Monitor en Vivo</h2>

      {/* Batería - Prominente */}
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>BATERÍA</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '48px', fontWeight: '700', color: device.battery >= 50 ? '#22c55e' : '#ef4444', minWidth: '80px' }}>
            {device.battery}%
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: '20px', backgroundColor: '#e5e7eb', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${device.battery}%`,
                  backgroundColor: device.battery >= 80 ? '#22c55e' : device.battery >= 50 ? '#f59e0b' : '#ef4444',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Estado: {getBatteryClass(device.battery)} | Última sync: {new Date(device.lastSync).toLocaleTimeString('es-ES')}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de 2 columnas - Volumen y Programa */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Volumen */}
        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>VOLUMEN</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb', marginBottom: '12px' }}>{newVolume}%</div>
          <input
            type="range"
            min="0"
            max="100"
            value={newVolume}
            onChange={handleVolumeChange}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Programa Actual */}
        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>PROGRAMA ACTUAL</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{device.currentProgram}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Activo</div>
        </div>
      </div>

      {/* Información adicional */}
      <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '12px', color: '#0369a1' }}>
        {connected ? '✅ Conectado en tiempo real' : '❌ Desconectado - Datos en caché'}
      </div>
    </div>
  );
};

export default RealtimeMonitor;
