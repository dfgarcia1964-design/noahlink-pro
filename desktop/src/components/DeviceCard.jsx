import React from 'react';

/**
 * DeviceCard - Tarjeta individual de dispositivo
 */
const DeviceCard = ({ device, isSelected, onClick }) => {
  if (!device) return null;

  const getBatteryColor = (level) => {
    if (level >= 80) return '#22c55e';
    if (level >= 50) return '#f59e0b';
    if (level >= 20) return '#ef4444';
    return '#7c2d12';
  };

  const getBatteryStatus = (level) => {
    if (level >= 80) return 'Excelente';
    if (level >= 50) return 'Bueno';
    if (level >= 20) return 'Bajo';
    return 'Crítico';
  };

  const batteryColor = getBatteryColor(device.battery);

  return (
    <div
      style={{
        padding: '16px',
        margin: '12px',
        border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
        borderRadius: '8px',
        backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
            {device.name}
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            {device.model}
          </p>
        </div>
        <span style={{ fontSize: '12px', color: device.connected ? '#22c55e' : '#ef4444' }}>
          {device.connected ? '●' : '○'} {device.connected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Batería</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: batteryColor }}>{device.battery}%</div>
          <div style={{ fontSize: '10px', color: batteryColor }}>{getBatteryStatus(device.battery)}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Programa</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>{device.currentProgram}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Volumen</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>{device.volume || 0}%</div>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
