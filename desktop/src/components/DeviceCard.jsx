import React from 'react';
import '../styles/DeviceCard.css';

const DeviceCard = ({ device }) => {
  return (
    <div className="device-card">
      <div className="device-card-header">
        <div className="device-icon">🎧</div>
        <div className="device-info">
          <h3>{device?.name || 'Dispositivo'}</h3>
          <span className="model">{device?.model || 'Modelo desconocido'}</span>
        </div>
        <div className="connection-status connected">
          <span className="status-dot"></span>
          Conectado
        </div>
      </div>

      <div className="device-card-body">
        <div className="info-grid">
          <div className="info-item">
            <label>Modelo</label>
            <value>{device?.model}</value>
          </div>
          <div className="info-item">
            <label>Serial</label>
            <value>{device?.serial}</value>
          </div>
          <div className="info-item">
            <label>Firmware</label>
            <value>{device?.firmware}</value>
          </div>
          <div className="info-item">
            <label>Señal</label>
            <value>{device?.rssi} dBm</value>
          </div>
        </div>

        <div className="device-actions">
          <button className="action-btn primary">
            ⚙️ Configuración
          </button>
          <button className="action-btn secondary">
            🔄 Reconectar
          </button>
          <button className="action-btn danger">
            🔌 Desconectar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
