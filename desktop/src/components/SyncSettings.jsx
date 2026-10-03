import React, { useState } from 'react';
import useProgramSync from '../hooks/useProgramSync';

const SyncSettings = ({ sourceDevice, programs, devices, onSync }) => {
  const { sync, loading, status } = useProgramSync(sourceDevice);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [mode, setMode] = useState('overwrite');

  const handleSync = async () => {
    await sync(programs, selectedDevices, mode);
    if (onSync) onSync();
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Sincronizar Programas</h2>

      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>Dispositivos Destino</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {devices.map((device) => (
            <label key={device.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedDevices.includes(device.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedDevices([...selectedDevices, device.id]);
                  } else {
                    setSelectedDevices(selectedDevices.filter(d => d !== device.id));
                  }
                }}
              />
              <span>{device.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>Modo</h3>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
        >
          <option value="overwrite">Sobrescribir</option>
          <option value="merge">Fusionar</option>
        </select>
      </div>

      {status && <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', marginBottom: '12px', fontSize: '12px', color: '#0369a1' }}>📡 {status}</div>}

      <button
        onClick={handleSync}
        disabled={loading || selectedDevices.length === 0}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: loading ? '#d1d5db' : '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          fontWeight: '700',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '⏳ Sincronizando...' : '🔄 Sincronizar'}
      </button>
    </div>
  );
};

export default SyncSettings;
