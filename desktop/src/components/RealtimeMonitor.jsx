import React, { useEffect, useState } from 'react';
import '../styles/RealtimeMonitor.css';

const RealtimeMonitor = ({ device, batteryHistory }) => {
  const [currentBattery, setCurrentBattery] = useState(85);
  const [updateTime, setUpdateTime] = useState(new Date());

  // Simulate real-time battery updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate gradual battery drain
      setCurrentBattery(prev => Math.max(0, prev - Math.random() * 0.5));
      setUpdateTime(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getBatteryStatus = (level) => {
    if (level >= 75) return { status: 'excellent', label: 'Excelente' };
    if (level >= 50) return { status: 'good', label: 'Bueno' };
    if (level >= 25) return { status: 'warning', label: 'Bajo' };
    return { status: 'critical', label: 'Crítico' };
  };

  const batteryStatus = getBatteryStatus(currentBattery);

  return (
    <div className="realtime-monitor">
      <h2>🔴 Monitor en Vivo</h2>

      <div className="monitor-content">
        {/* Battery Gauge */}
        <div className="battery-gauge">
          <div className={`gauge ${batteryStatus.status}`}>
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
            <div className="gauge-status">{batteryStatus.label}</div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="status-indicators">
          <div className="indicator">
            <label>Conexión</label>
            <div className="indicator-value connected">
              <span className="dot"></span>
              Conectado
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

      <div className="battery-trend">
        <h3>Tendencia de Batería (últimas 4h)</h3>
        <div className="mini-chart">
          {batteryHistory.slice(-4).map((h, i) => (
            <div
              key={i}
              className="bar"
              style={{ height: `${h.level}%` }}
              title={`${h.level}%`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealtimeMonitor;
