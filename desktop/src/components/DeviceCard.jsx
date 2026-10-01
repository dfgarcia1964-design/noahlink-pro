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
            <span>{device?.model}</span>
          </div>
          <div className="info-item">
            <label>Serial</label>
            <span>{device?.serial}</span>
          </div>
          <div className="info-item">
            <label>Firmware</label>
            <span>{device?.firmware}</span>
          </div>
          <div className="info-item">
            <label>Señal</label>
            <span>{device?.rssi} dBm</span>
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
