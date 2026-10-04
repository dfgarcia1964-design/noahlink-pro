import React, { useState } from 'react';

const BatteryChartDemo = ({ device }) => {
  const [range, setRange] = useState('7d');

  // Simular datos de batería para gráfico
  const generateBatteryData = (days) => {
    const data = [];
    const now = new Date();
    const step = (days * 24 * 60 * 60 * 1000) / 30; // 30 puntos

    for (let i = 0; i < 30; i++) {
      const time = new Date(now.getTime() - (29 - i) * step);
      data.push({
        time: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        level: Math.max(10, 99 - (i * 2 + Math.random() * 5))
      });
    }
    return data;
  };

  const data = generateBatteryData(range === '7d' ? 7 : range === '30d' ? 30 : 1);
  const avgBattery = Math.round(data.reduce((sum, d) => sum + d.level, 0) / data.length);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>📊 Análisis de Batería</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['24h', '7d', '30d'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '8px 12px',
                backgroundColor: range === r ? '#2563eb' : '#e5e7eb',
                color: range === r ? '#ffffff' : '#1f2937',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Promedio</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>{avgBattery}%</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Máximo</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>99%</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Mínimo</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{Math.min(...data.map(d => d.level)).toFixed(0)}%</div>
        </div>
      </div>

      {/* Gráfico simulado */}
      <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', height: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '4px' }}>
        <div style={{ display: 'flex', gap: '2px', height: '100%', alignItems: 'flex-end' }}>
          {data.map((d, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${d.level}%`,
                backgroundColor: d.level >= 80 ? '#22c55e' : d.level >= 50 ? '#f59e0b' : '#ef4444',
                borderRadius: '2px',
                transition: 'all 0.3s'
              }}
              title={`${d.time}: ${d.level.toFixed(0)}%`}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
        Últimas {range} - Datos en tiempo real
      </div>
    </div>
  );
};

export default BatteryChartDemo;
