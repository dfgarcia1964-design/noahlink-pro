import React, { useState, useEffect } from 'react';

/**
 * RealtimeMonitor - Monitor en vivo del dispositivo
 * Muestra batería, volumen, programa, señal en tiempo real
 */
const RealtimeMonitor = ({ device, userId = 'user-001' }) => {
  const [volume, setVolume] = useState(75);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (device) {
      setVolume(device.volume || 75);
    }
  }, [device?.id]);

  if (!device) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Selecciona un dispositivo</div>;
  }

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    setFeedback('✓ Volumen actualizado');
    setTimeout(() => setFeedback(''), 1000);
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
        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '2px solid #2563eb', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>🔊 VOLUMEN</div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#2563eb', marginBottom: '12px', textAlign: 'center', transition: 'font-size 0.2s' }}>
            {volume}%
          </div>
          <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{
              height: '100%',
              width: `${volume}%`,
              backgroundColor: '#2563eb',
              transition: 'width 0.1s ease',
              borderRadius: '4px'
            }} />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: '#2563eb',
              height: '6px'
            }}
          />
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
            {volume < 33 ? '🔇 Bajo' : volume < 66 ? '🔉 Medio' : '🔊 Alto'}
            {feedback && <span style={{ marginLeft: '8px', color: '#22c55e', fontWeight: '600' }}>{feedback}</span>}
          </div>
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
        {device?.connected ? '✅ Conectado en tiempo real' : '❌ Desconectado - Datos en caché'}
      </div>
    </div>
  );
};

export default RealtimeMonitor;
