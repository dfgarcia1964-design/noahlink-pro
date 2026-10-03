import React, { useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const DeviceAnalyticsDetail = ({ deviceId, userId = 'user-001' }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [correlationData, setCorrelationData] = useState([]);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  const getDays = (range) => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, [deviceId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const days = getDays(timeRange);

      const [usageRes, batteryRes, anomalyRes] = await Promise.all([
        axios.get(`${API_BASE}/devices/${deviceId}/analytics/usage?days=${days}`),
        axios.get(`${API_BASE}/devices/${deviceId}/analytics/prediction`),
        axios.get(`${API_BASE}/devices/${deviceId}/analytics/anomalies?days=${days}`)
      ]);

      const analysisData = {
        usage: usageRes.data.data,
        battery: batteryRes.data.data,
        anomalies: anomalyRes.data.data.anomalies,
        timeRange
      };

      setData(analysisData);

      // Generar datos de correlación simulados
      const correlation = Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        battery: Math.max(0, 100 - (i * 3 + Math.random() * 10)),
        usage: Math.min(8, (i % 5) + Math.random() * 3)
      }));
      setCorrelationData(correlation);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando análisis...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: '#ef4444' }}>Error: {error}</div>;
  }

  if (!data) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Sin datos</div>;
  }

  const rangeLabel = timeRange === '7d' ? 'últimos 7 días' : timeRange === '30d' ? 'últimos 30 días' : 'últimos 90 días';

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '700' }}>Análisis Detallado</h2>
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

      <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#6b7280' }}>
        Análisis de rendimiento para los {rangeLabel}
      </p>

      {/* Resumen General */}
      <div style={{
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Resumen General</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Uso</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>
              {data.usage.totalUsageHours}h
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Sesiones</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
              {data.usage.sessionCount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Batería Actual</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e' }}>
              {data.battery.currentBattery}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Horas Restantes</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
              {data.battery.hoursRemainingFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Correlación */}
      {correlationData.length > 0 && (
        <div style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            Correlación: Batería vs Uso
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={correlationData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Día', position: 'insideBottomRight', offset: -5 }} />
              <YAxis yAxisId="left" label={{ value: 'Batería (%)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Uso (h)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="battery" fill="#2563eb" name="Batería" />
              <Line yAxisId="right" type="monotone" dataKey="usage" stroke="#f59e0b" name="Uso" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Anomalías Detectadas */}
      {data.anomalies && data.anomalies.length > 0 && (
        <div style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            Anomalías Detectadas ({data.anomalies.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.anomalies.map((anomaly, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: '#fef3c7',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '4px'
              }}>
                <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                  {anomaly.type}
                </div>
                <div style={{ fontSize: '12px', color: '#92400e' }}>
                  {anomaly.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.anomalies && data.anomalies.length === 0 && (
        <div style={{
          padding: '16px',
          backgroundColor: '#dcfce7',
          border: '1px solid #86efac',
          borderRadius: '6px',
          color: '#166534',
          textAlign: 'center'
        }}>
          ✅ No se detectaron anomalías
        </div>
      )}

      {/* Información de Estadísticas */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f0f9ff',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#0369a1'
      }}>
        <strong>Volumen:</strong> Mín {data.usage.volumeStats.min}% | Máx {data.usage.volumeStats.max}% | Promedio {data.usage.volumeStats.average}%
      </div>
    </div>
  );
};

export default DeviceAnalyticsDetail;
