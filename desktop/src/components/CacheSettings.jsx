import React, { useState } from 'react';
import useCacheService from '../hooks/useCacheService';

const CacheSettings = () => {
  const { clear, stats } = useCacheService();
  const [ttlBattery, setTtlBattery] = useState(300000);
  const [ttlEvents, setTtlEvents] = useState(600000);
  const [ttlPrograms, setTtlPrograms] = useState(1800000);

  const handleClear = () => {
    clear();
    alert('Caché limpiado');
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1000;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Configuración de Caché</h2>

      {stats && (
        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Items en caché</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>{stats.size}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Salud del caché</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e' }}>Óptimo</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '6px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>TTL por Tipo</h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Batería: {(ttlBattery / 1000 / 60).toFixed(1)} minutos
          </label>
          <input
            type="range"
            min="60000"
            max="600000"
            step="60000"
            value={ttlBattery}
            onChange={(e) => setTtlBattery(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Eventos: {(ttlEvents / 1000 / 60).toFixed(1)} minutos
          </label>
          <input
            type="range"
            min="60000"
            max="1200000"
            step="60000"
            value={ttlEvents}
            onChange={(e) => setTtlEvents(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Programas: {(ttlPrograms / 1000 / 60).toFixed(1)} minutos
          </label>
          <input
            type="range"
            min="300000"
            max="3600000"
            step="300000"
            value={ttlPrograms}
            onChange={(e) => setTtlPrograms(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <button
        onClick={handleClear}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          fontWeight: '700',
          cursor: 'pointer'
        }}
      >
        🗑️ Limpiar Caché
      </button>

      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '11px', color: '#0369a1' }}>
        💡 Ajusta los TTL según tu uso típico. Valores más altos = menos solicitudes de red, pero datos más antiguos.
      </div>
    </div>
  );
};

export default CacheSettings;
