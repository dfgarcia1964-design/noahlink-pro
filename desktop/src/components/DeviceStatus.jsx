/**
 * DeviceStatus Component
 * Muestra información del dispositivo conectado
 */

import React from 'react';
import './DeviceStatus.css';

function DeviceStatus({ device }) {
  if (!device) {
    return <div className="device-status">No hay dispositivo conectado</div>;
  }

  return (
    <div className="device-status">
      <div className="status-header">
        <h2>🎧 {device.name}</h2>
        <span className="status-badge">Conectado ✅</span>
      </div>

      <div className="status-grid">
        <div className="status-item">
          <label>Modelo</label>
          <p>{device.model || 'Naída UP 90'}</p>
        </div>

        <div className="status-item">
          <label>Serial</label>
          <p className="serial">{device.serial || 'N/A'}</p>
        </div>

        <div className="status-item">
          <label>Firmware</label>
          <p>{device.firmware || '9.2.5'}</p>
        </div>

        <div className="status-item">
          <label>Conexión</label>
          <p>Bluetooth BLE</p>
        </div>

        <div className="status-item">
          <label>Señal RSSI</label>
          <p className="signal">{device.signalStrength || '-50'} dBm</p>
        </div>

        <div className="status-item">
          <label>Conectado desde</label>
          <p>{device.connectedAt ? new Date(device.connectedAt).toLocaleTimeString() : 'Ahora'}</p>
        </div>
      </div>

      <div className="device-features">
        <h4>Características Disponibles:</h4>
        <ul>
          <li>✅ Control de Volumen</li>
          <li>✅ Monitoreo de Batería</li>
          <li>✅ Cambio de Programas</li>
          <li>✅ Control de Micrófono</li>
        </ul>
      </div>
    </div>
  );
}

export default DeviceStatus;
