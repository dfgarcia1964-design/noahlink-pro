import React, { useState } from 'react';
import '../styles/ProgramManager.css';

const ProgramManager = ({ deviceId }) => {
  const [currentProgram, setCurrentProgram] = useState('speech');
  const [loading, setLoading] = useState(false);

  const programs = [
    {
      id: 'speech',
      name: 'Conversación',
      icon: '👥',
      description: 'Optimizado para conversación en ambientes normales',
      frequency: [100, 500, 1000, 2000, 4000, 8000],
      gain: [5, 8, 10, 12, 15, 18]
    },
    {
      id: 'noise',
      name: 'Ruido',
      icon: '🔊',
      description: 'Reduce ruido de fondo',
      frequency: [100, 500, 1000, 2000, 4000, 8000],
      gain: [2, 3, 5, 8, 12, 15]
    },
    {
      id: 'music',
      name: 'Música',
      icon: '🎵',
      description: 'Mejor reproducción de música',
      frequency: [100, 500, 1000, 2000, 4000, 8000],
      gain: [8, 10, 12, 15, 18, 20]
    },
    {
      id: 'outdoor',
      name: 'Aire Libre',
      icon: '🌳',
      description: 'Para ambientes al aire libre',
      frequency: [100, 500, 1000, 2000, 4000, 8000],
      gain: [10, 12, 15, 18, 20, 22]
    },
    {
      id: 'telecoil',
      name: 'Bobina Telefónica',
      icon: '📞',
      description: 'Para dispositivos compatible con bobina',
      frequency: [500, 1000, 2000, 4000],
      gain: [15, 18, 20, 22]
    }
  ];

  const handleSwitchProgram = async (programId) => {
    setLoading(true);
    try {
      // Simular cambio de programa
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentProgram(programId);
    } catch (error) {
      console.error('Error switching program:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentProgramData = programs.find(p => p.id === currentProgram);

  return (
    <div className="program-manager">
      <div className="grid-2col">
        {/* Program List */}
        <div className="program-list">
          <h3>Programas Disponibles</h3>
          <div className="programs">
            {programs.map(program => (
              <button
                key={program.id}
                className={`program-item ${currentProgram === program.id ? 'active' : ''}`}
                onClick={() => handleSwitchProgram(program.id)}
                disabled={loading}
              >
                <span className="program-icon">{program.icon}</span>
                <div className="program-text">
                  <div className="program-name">{program.name}</div>
                  <div className="program-desc">{program.description}</div>
                </div>
                {currentProgram === program.id && <span className="checkmark">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Program Details */}
        <div className="program-details">
          <h3>Detalles del Programa</h3>
          {currentProgramData && (
            <div className="details-panel">
              <div className="program-header">
                <span className="icon">{currentProgramData.icon}</span>
                <div>
                  <h4>{currentProgramData.name}</h4>
                  <p>{currentProgramData.description}</p>
                </div>
              </div>

              <div className="settings-section">
                <h5>Configuración de Ganancia</h5>
                <div className="frequency-grid">
                  {currentProgramData.frequency.map((freq, idx) => (
                    <div key={idx} className="frequency-item">
                      <label>{freq}Hz</label>
                      <div className="gain-bar">
                        <div
                          className="gain-fill"
                          style={{ height: `${(currentProgramData.gain[idx] / 25) * 100}%` }}
                        />
                      </div>
                      <span className="gain-value">{currentProgramData.gain[idx]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="program-actions">
                <button
                  className="btn primary"
                  onClick={() => handleSwitchProgram(currentProgram)}
                  disabled={loading}
                >
                  {loading ? '⏳ Cambiando...' : '✓ Activar Programa'}
                </button>
                <button className="btn secondary">
                  ⚙️ Editar Personalizado
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramManager;
