/**
 * BatteryIndicator Component
 * Muestra nivel de batería del audífono
 */

import React from 'react';
import './BatteryIndicator.css';

function BatteryIndicator({ battery }) {
  if (!battery) {
    return (
      <div className="battery-indicator">
        <h3>🔋 Batería</h3>
        <p className="loading">Cargando...</p>
      </div>
    );
  }

  const getStatusClass = (level) => {
    if (level >= 50) return 'good';
    if (level >= 20) return 'medium';
    return 'low';
  };

  const statusClass = getStatusClass(battery.level);

  return (
    <div className="battery-indicator">
      <h3>🔋 Batería</h3>

      <div className={`battery-bar ${statusClass}`}>
        <div
          className="battery-fill"
          style={{ width: `${battery.level}%` }}
        ></div>
      </div>

      <p className="battery-percentage">{battery.percentage}</p>

      <div className={`battery-status ${statusClass}`}>
        {battery.level >= 50 && '✅ Excelente'}
        {battery.level >= 20 && battery.level < 50 && '⚠️ Bueno'}
        {battery.level < 20 && '🚨 Bajo - Cargue pronto'}
      </div>

      <div className="battery-details">
        <p>Actualizado: {battery.timestamp ? new Date(battery.timestamp).toLocaleTimeString() : 'Ahora'}</p>
      </div>
    </div>
  );
}

export default BatteryIndicator;
