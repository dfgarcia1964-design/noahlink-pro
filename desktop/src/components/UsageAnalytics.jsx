import React, { useState } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import useUsageStats from '../hooks/useUsageStats';

const UsageAnalytics = ({ deviceId }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const { stats, loading, error, refresh } = useUsageStats(deviceId, timeRange);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando estadísticas...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: '#ef4444' }}>Error: {error}</div>;
  }

  if (!stats) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Sin datos disponibles</div>;
  }

  const timeRangeLabel = timeRange === '7d' ? 'últimos 7 días' : timeRange === '30d' ? 'últimos 30 días' : 'últimos 90 días';
  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

  const programData = Object.entries(stats.programUsage).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '700' }}>Análisis de Uso</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: timeRange === range ? '#2563eb' : '#e5e7eb',
                color: timeRange === range ? '#ffffff' : '#1f2937'
              }}
            >
              {range === '7d' ? '7D' : range === '30d' ? '30D' : '90D'}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total de Uso</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
            {stats.totalUsageHours}h
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Sesiones</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
            {stats.sessionCount}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Promedio/Sesión</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>
            {stats.averageSessionLength}h
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Por Día</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
            {stats.sessionsPerDay}
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Distribución de Programas */}
        {programData.length > 0 && (
          <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Distribución de Programas</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={programData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {programData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Estadísticas de Volumen */}
        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Estadísticas de Volumen</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Promedio</div>
              <div style={{
                height: '24px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    height: '100%',
                    width: `${stats.volumeStats.average}%`,
                    backgroundColor: '#2563eb',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>
                {stats.volumeStats.average}%
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Mínimo</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>
                  {stats.volumeStats.min}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Máximo</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>
                  {stats.volumeStats.max}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          color: '#1f2937'
        }}
      >
        🔄 Refrescar
      </button>
    </div>
  );
};

export default UsageAnalytics;
