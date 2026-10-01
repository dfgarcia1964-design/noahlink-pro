import React, { useState } from 'react';
import '../styles/ProgramEditor.css';

const ProgramEditor = ({ onSave }) => {
  const [programName, setProgramName] = useState('Mi Programa Personalizado');
  const [frequencies, setFrequencies] = useState({
    100: 5, 500: 8, 1000: 10, 2000: 12, 4000: 15, 8000: 18
  });
  const [mode, setMode] = useState('edit'); // 'view' o 'edit'

  const handleFrequencyChange = (freq, value) => {
    setFrequencies(prev => ({ ...prev, [freq]: parseInt(value) }));
  };

  const handleSave = () => {
    onSave({ name: programName, settings: frequencies });
    setMode('view');
  };

  return (
    <div className="program-editor">
      <h2>🎵 Editor de Programas Avanzado</h2>

      <div className="editor-container">
        <div className="program-name-section">
          <label>Nombre del Programa:</label>
          <input
            type="text"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            disabled={mode === 'view'}
            className="program-name-input"
          />
        </div>

        <div className="frequency-editor">
          <h3>Respuesta de Frecuencia</h3>
          <div className="frequency-sliders">
            {Object.entries(frequencies).map(([freq, gain]) => (
              <div key={freq} className="frequency-control">
                <label>{freq}Hz</label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={gain}
                  onChange={(e) => handleFrequencyChange(freq, e.target.value)}
                  disabled={mode === 'view'}
                  className="frequency-slider"
                />
                <span className="gain-display">{gain}dB</span>
              </div>
            ))}
          </div>
        </div>

        <div className="frequency-graph">
          <h4>Gráfico de Respuesta</h4>
          <svg viewBox="0 0 400 200" className="response-graph">
            <defs>
              <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#667eea', stopOpacity: 0.3}} />
                <stop offset="100%" style={{stopColor: '#667eea', stopOpacity: 0}} />
              </linearGradient>
            </defs>

            {/* Grid */}
            <g stroke="#e5e7eb" strokeWidth="1">
              <line x1="40" y1="20" x2="40" y2="180" />
              <line x1="40" y1="180" x2="390" y2="180" />
              {[40, 115, 190, 265, 340].map((x, i) => (
                <line key={`v${i}`} x1={x} y1="175" x2={x} y2="185" />
              ))}
            </g>

            {/* Curve */}
            <polyline
              points={[
                [50, 150], [115, 140], [190, 120], [265, 100], [340, 80]
              ].map(([x, y]) => `${x},${y}`).join(' ')}
              fill="url(#fillGradient)"
              stroke="#667eea"
              strokeWidth="2"
            />

            {/* Points */}
            {[50, 115, 190, 265, 340].map((x, i) => (
              <circle key={i} cx={x} cy={150 - (frequencies[Object.keys(frequencies)[i]] || 0) * 5} r="4" fill="#667eea" />
            ))}

            {/* Labels */}
            <text x="20" y="100" fontSize="12" fill="#666">dB</text>
            <text x="190" y="200" fontSize="12" fill="#666" textAnchor="middle">Hz</text>
          </svg>
        </div>

        <div className="editor-actions">
          {mode === 'edit' ? (
            <>
              <button className="btn primary" onClick={handleSave}>
                ✓ Guardar Programa
              </button>
              <button className="btn secondary" onClick={() => setMode('view')}>
                ✕ Cancelar
              </button>
            </>
          ) : (
            <>
              <button className="btn primary" onClick={() => setMode('edit')}>
                ✎ Editar
              </button>
              <button className="btn secondary" onClick={() => alert('Programa aplicado: ' + programName)}>
                ✓ Aplicar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramEditor;
