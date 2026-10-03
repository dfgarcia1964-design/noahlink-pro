import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import useBatteryPrediction from '../hooks/useBatteryPrediction';

const BatteryPredictionChart = ({ deviceId }) => {
  const { prediction, trend, loading, error, refresh, accuracy, getStatus } = useBatteryPrediction(deviceId);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Calculando...</div>;
  }

  if (error || !prediction) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>Error al calcular predicción</div>;
  }

  const status = getStatus();
  const statusColor = {
    'Crítico': '#ef4444',
    'Bajo': '#f59e0b',
    'Moderado': '#f59e0b',
    'Bueno': '#22c55e',
    'Unknown': '#6b7280'
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700' }}>Predicción de Batería</h2>

      <div style={{
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        border: `2px solid ${statusColor[status] || '#e5e7eb'}`,
        marginBottom: '20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Batería</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
              {prediction.currentBattery}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Horas</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>
              {prediction.hoursRemainingFormatted}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Drenaje</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>
              {prediction.drainRate}%/h
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Estado</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: statusColor[status] }}>
              {status}
            </div>
          </div>
        </div>
      </div>

      {trend.length > 0 && (
        <div style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Próximas 24 horas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBattery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="battery"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#colorBattery)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{
        padding: '12px',
        backgroundColor: '#f0f9ff',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#0369a1',
        marginBottom: '12px'
      }}>
        Precisión: {accuracy}% | Confianza: {prediction.confidence}
      </div>

      <button
        onClick={refresh}
        style={{
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: '600',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          cursor: 'pointer',
          backgroundColor: '#ffffff'
        }}
      >
        Refrescar
      </button>
    </div>
  );
};

export default BatteryPredictionChart;
