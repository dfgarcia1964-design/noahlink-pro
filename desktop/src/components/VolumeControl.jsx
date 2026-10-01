/**
 * VolumeControl Component
 * Control de volumen del audífono
 */

import React from 'react';
import './VolumeControl.css';

function VolumeControl({ volume, onVolumeChange, disabled }) {
  return (
    <div className="volume-control">
      <h3>🔊 Control de Volumen</h3>

      <div className="volume-display">
        <p className="volume-percentage">{volume}%</p>
      </div>

      <div className="volume-slider-container">
        <span className="volume-icon">🔇</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          className="volume-slider"
          disabled={disabled}
        />
        <span className="volume-icon">🔊</span>
      </div>

      <div className="quick-buttons">
        <button
          onClick={() => onVolumeChange(Math.max(0, volume - 10))}
          disabled={disabled}
          className="quick-btn"
        >
          -10%
        </button>
        <button
          onClick={() => onVolumeChange(50)}
          disabled={disabled}
          className="quick-btn center"
        >
          50%
        </button>
        <button
          onClick={() => onVolumeChange(Math.min(100, volume + 10))}
          disabled={disabled}
          className="quick-btn"
        >
          +10%
        </button>
      </div>

      <div className="volume-status">
        <p>
          {volume === 0 && '🔇 Muted'}
          {volume > 0 && volume <= 25 && '🔈 Bajo'}
          {volume > 25 && volume <= 50 && '🔉 Medio'}
          {volume > 50 && volume <= 75 && '🔊 Alto'}
          {volume > 75 && '📢 Muy Alto'}
        </p>
      </div>
    </div>
  );
}

export default VolumeControl;
