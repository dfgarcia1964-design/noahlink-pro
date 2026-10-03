import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import useBatteryHistory from '../hooks/useBatteryHistory';

/**
 * BatteryChart - Gráfico de tendencias de batería con Recharts
 * Muestra historial de batería en gráfico de líneas
 */
const BatteryChart = ({ deviceId }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const { data, stats, loading, error, refresh } = useBatteryHistory(deviceId, timeRange);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', height: '400px' }}>Cargando gráfico...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: '#ef4444' }}>Error: {error}</div>;
  }

  if (!data || data.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Sin datos disponibles</div>;
  }

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const getRangeLabel = () => {
    if (timeRange === '24h') return 'Últimas 24 horas';
    if (timeRange === '7d') return 'Últimos 7 días';
    if (timeRange === '30d') return 'Últimos 30 días';
    return timeRange;
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '700' }}>Tendencia de Batería</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: timeRange === range ? '#2563eb' : '#e5e7eb',
                color: timeRange === range ? '#ffffff' : '#1f2937',
                transition: 'all 0.2s'
              }}
            >
              {range === '24h' ? '24H' : range === '7d' ? '7D' : '30D'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
          {getRangeLabel()}
        </p>
      </div>

      {/* Gráfico */}
      <div style={{ width: '100%', height: '300px', backgroundColor: '#ffffff', borderRadius: '6px', padding: '12px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              interval={Math.floor(data.length / 5)}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ value: '%', angle: -90, position: 'insideLeftMiddle', offset: 10, fill: '#6b7280' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
              formatter={(value) => [`${value}%`, 'Batería']}
              labelStyle={{ color: '#1f2937' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '12px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="level"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: '#2563eb', r: 4 }}
              activeDot={{ r: 6 }}
              name="Nivel de Batería"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Máximo</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e' }}>
              {stats.max}%
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Promedio</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
              {stats.average}%
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Mínimo</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444' }}>
              {stats.min}%
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Drenaje</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
              {stats.drainRate}%/h
            </div>
          </div>
        </div>
      )}

      {/* Botón de refrescar */}
      <button
        onClick={refresh}
        style={{
          marginTop: '16px',
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: '600',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          cursor: 'pointer',
          backgroundColor: '#ffffff',
          color: '#1f2937',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
      >
        🔄 Refrescar datos
      </button>
    </div>
  );
};

export default BatteryChart;
