import React from 'react';
import { useRealtimeData, useBatteryHistory } from '../hooks/useRealtimeData';
import '../styles/RealtimeMonitor.css';

const RealtimeMonitor = ({ device, batteryHistory: initialHistory }) => {
  // Fetch real-time data every 5 seconds
  const { battery: batteryData, loading, error } = useRealtimeData(
    device?.id,
    5000
  );

  // Fetch battery history for trend
  const { history: liveHistory } = useBatteryHistory(device?.id, 4);

  // Use battery data from API, fallback to initial data
  const currentBattery = batteryData?.battery ?? 85;
  const batteryStatus = batteryData?.status ?? 'good';
  const batteryLabel = batteryData?.statusLabel ?? 'Bueno';
  const updateTime = new Date();

  const getStatusStyle = () => {
    if (currentBattery >= 75) return 'excellent';
    if (currentBattery >= 50) return 'good';
    if (currentBattery >= 25) return 'warning';
    return 'critical';
  };

  return (
    <div className="realtime-monitor">
      <h2>🔴 Monitor en Vivo {loading && <span className="spinner">⟳</span>}</h2>

      <div className="monitor-content">
        {/* Battery Gauge */}
        <div className="battery-gauge">
          <div className={`gauge ${getStatusStyle()}`}>
            <div className="gauge-label">{Math.round(currentBattery)}%</div>
            <div className="gauge-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="bg" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="fill"
                  style={{
                    strokeDashoffset: 283 - (283 * currentBattery / 100)
                  }}
                />
              </svg>
            </div>
            <div className="gauge-status">{batteryLabel}</div>
            {error && <div className="gauge-error">⚠ Error</div>}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="status-indicators">
          <div className="indicator">
            <label>Conexión</label>
            <div className={`indicator-value ${device ? 'connected' : 'disconnected'}`}>
              <span className="dot"></span>
              {device ? 'Conectado' : 'Desconectado'}
            </div>
          </div>

          <div className="indicator">
            <label>Señal</label>
            <div className="indicator-value">
              <span className="signal-bars">
                <span className={device?.rssi > -50 ? 'active' : ''}></span>
                <span className={device?.rssi > -60 ? 'active' : ''}></span>
                <span className={device?.rssi > -70 ? 'active' : ''}></span>
              </span>
              {device?.rssi || 0} dBm
            </div>
          </div>

          <div className="indicator">
            <label>Actualización</label>
            <div className="indicator-value">
              {updateTime.toLocaleTimeString('es-ES')}
              {loading && <span className="pulse"></span>}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="quick-action" title="Subir volumen">
            🔊 Volumen
          </button>
          <button className="quick-action" title="Cambiar programa">
            🎵 Programas
          </button>
          <button className="quick-action" title="Micrófono">
            🎤 Micrófono
          </button>
          <button className="quick-action" title="Sincronizar">
            🔄 Sincronizar
          </button>
        </div>
      </div>

      {/* Battery Trend - Last 4 hours */}
      <div className="battery-trend">
        <h3>Tendencia de Batería (últimas 4h)</h3>
        <div className="mini-chart">
          {(liveHistory.length > 0 ? liveHistory : initialHistory.slice(-4)).map((h, i) => (
            <div
              key={i}
              className="bar"
              style={{ height: `${h.level}%` }}
              title={`${h.level}% - ${new Date(h.timestamp).toLocaleTimeString('es-ES')}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealtimeMonitor;
