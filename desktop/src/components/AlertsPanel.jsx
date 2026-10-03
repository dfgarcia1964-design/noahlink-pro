import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AlertsPanel = ({ deviceId, userId = 'user-001' }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  useEffect(() => {
    fetchAnomalies();
  }, [deviceId]);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/devices/${deviceId}/analytics/anomalies?days=7`
      );

      if (res.data.success) {
        setAlerts(res.data.data.anomalies || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      setLoading(false);
    }
  };

  const dismissAlert = (index) => {
    setDismissedAlerts([...dismissedAlerts, index]);
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const visibleAlerts = alerts.filter((_, i) => !dismissedAlerts.includes(i));

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando alertas...</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
        Alertas y Notificaciones
      </h2>

      {visibleAlerts.length === 0 ? (
        <div style={{
          padding: '20px',
          backgroundColor: '#dcfce7',
          borderRadius: '6px',
          border: '1px solid #86efac',
          color: '#166534',
          textAlign: 'center'
        }}>
          ✅ Todo está bien - No hay alertas
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visibleAlerts.map((alert, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                backgroundColor: '#ffffff',
                border: `2px solid ${getAlertColor(alert.severity)}`,
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {getAlertIcon(alert.severity)}
                  </span>
                  <span style={{ fontWeight: '700', color: getAlertColor(alert.severity) }}>
                    {alert.type.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '14px', color: '#1f2937', marginBottom: '6px' }}>
                  {alert.message}
                </div>

                <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                  💡 {alert.recommendation}
                </div>
              </div>

              <button
                onClick={() => dismissAlert(idx)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  whiteSpace: 'nowrap'
                }}
              >
                Descartar
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '12px', color: '#0369a1' }}>
        <strong>Auto-refresh:</strong> Los alertas se actualizan cada 5 minutos
      </div>
    </div>
  );
};

export default AlertsPanel;
