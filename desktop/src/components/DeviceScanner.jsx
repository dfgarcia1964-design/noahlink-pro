/**
 * DeviceScanner Component
 * Escanea y lista dispositivos Phonak disponibles
 */

import React from 'react';
import './DeviceScanner.css';

function DeviceScanner({ devices, loading, onScan, onConnect }) {
  return (
    <div className="device-scanner">
      <h2>🔍 Escanear Dispositivos</h2>

      <button
        className="scan-btn"
        onClick={onScan}
        disabled={loading}
      >
        {loading ? '⏳ Escaneando...' : '🔍 Escanear'}
      </button>

      <div className="devices-list">
        <h3>Dispositivos Encontrados ({devices.length})</h3>

        {devices.length === 0 ? (
          <p className="no-devices">
            No se encontraron dispositivos. Presiona "Escanear" para buscar.
          </p>
        ) : (
          <ul>
            {devices.map((device) => (
              <li key={device.id} className="device-item">
                <div className="device-info">
                  <h4>🎧 {device.name}</h4>
                  <p>ID: {device.id}</p>
                  <p>Señal: {device.rssi} dBm</p>
                </div>
                <button
                  className="connect-btn"
                  onClick={() => onConnect(device.id)}
                  disabled={loading}
                >
                  Conectar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="help-text">
        <p>💡 Asegúrate que el audífono Naída UP 90 esté encendido y en rango Bluetooth.</p>
      </div>
    </div>
  );
}

export default DeviceScanner;
