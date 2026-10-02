import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ProgramManager.css';

const ProgramManager = ({ deviceId = 'sky-l-90-up-left' }) => {
  const [programs, setPrograms] = useState([]);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Load programs on mount
  useEffect(() => {
    fetchPrograms();
  }, [deviceId]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/v1/devices/${deviceId}/programs`
      );

      if (response.data.programs) {
        setPrograms(response.data.programs);
        setCurrentProgram(response.data.activeProgram);
        setSelectedProgram(response.data.activeProgram);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('No se pudieron cargar los programas');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchProgram = async (programId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `/api/v1/devices/${deviceId}/programs/${programId}/switch`
      );

      if (response.data.success) {
        setCurrentProgram(programId);
        setSelectedProgram(programId);
        console.log(`✓ Programa cambiado a: ${programId}`);
      }
      setError(null);
    } catch (err) {
      console.error('Error switching program:', err);
      setError(`Error al cambiar programa: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentProgramData = programs.find(p => p.id === selectedProgram);

  if (error && !programs.length) {
    return (
      <div className="program-manager error">
        <div className="error-message">⚠️ {error}</div>
        <button onClick={fetchPrograms} className="btn primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="program-manager">
      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="close">✕</button>
        </div>
      )}

      <div className="grid-2col">
        {/* Program List */}
        <div className="program-list">
          <h3>🎵 Programas Disponibles</h3>
          <div className="programs">
            {programs.length > 0 ? (
              programs.map(program => (
                <button
                  key={program.id}
                  className={`program-item ${selectedProgram === program.id ? 'selected' : ''} ${currentProgram === program.id ? 'active' : ''}`}
                  onClick={() => setSelectedProgram(program.id)}
                  disabled={loading}
                  title={program.description}
                >
                  <span className="program-icon">{program.icon}</span>
                  <div className="program-text">
                    <div className="program-name">{program.name}</div>
                    <div className="program-category">{program.category}</div>
                  </div>
                  {currentProgram === program.id && (
                    <span className="active-badge">✓ Activo</span>
                  )}
                </button>
              ))
            ) : (
              <div className="empty">Cargando programas...</div>
            )}
          </div>
        </div>

        {/* Program Details */}
        <div className="program-details">
          <h3>📊 Detalles del Programa</h3>
          {currentProgramData ? (
            <div className="details-panel">
              <div className="program-header">
                <span className="icon">{currentProgramData.icon}</span>
                <div>
                  <h4>{currentProgramData.name}</h4>
                  <p className="description">{currentProgramData.description}</p>
                  <span className="category-badge">{currentProgramData.category}</span>
                </div>
              </div>

              {/* Frequency Response Chart */}
              <div className="settings-section">
                <h5>Respuesta de Frecuencia</h5>
                <div className="frequency-grid">
                  {currentProgramData.frequency?.map((freq, idx) => (
                    <div key={idx} className="frequency-item">
                      <label>{freq}Hz</label>
                      <div className="gain-bar">
                        <div
                          className="gain-fill"
                          style={{ height: `${(currentProgramData.gain[idx] / 25) * 100}%` }}
                        />
                      </div>
                      <span className="gain-value">{currentProgramData.gain[idx]}dB</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="settings-section">
                <h5>Estadísticas</h5>
                <div className="stats-grid">
                  <div className="stat">
                    <label>Ganancia Promedio</label>
                    <span className="value">
                      {Math.round(
                        currentProgramData.gain.reduce((a, b) => a + b) / currentProgramData.gain.length
                      )}dB
                    </span>
                  </div>
                  <div className="stat">
                    <label>Ganancia Máxima</label>
                    <span className="value">
                      {Math.max(...currentProgramData.gain)}dB
                    </span>
                  </div>
                  <div className="stat">
                    <label>Ganancia Mínima</label>
                    <span className="value">
                      {Math.min(...currentProgramData.gain)}dB
                    </span>
                  </div>
                  <div className="stat">
                    <label>Rango de Frecuencias</label>
                    <span className="value">
                      {Math.min(...currentProgramData.frequency)}-{Math.max(...currentProgramData.frequency)}Hz
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="program-actions">
                {currentProgram === selectedProgram ? (
                  <button className="btn primary active" disabled>
                    ✓ Programa Activo
                  </button>
                ) : (
                  <button
                    className="btn primary"
                    onClick={() => handleSwitchProgram(selectedProgram)}
                    disabled={loading}
                  >
                    {loading ? '⏳ Cambiando...' : '🎵 Activar Programa'}
                  </button>
                )}
                <button className="btn secondary" disabled>
                  ⚙️ Editar Personalizado (Phase 3)
                </button>
              </div>
            </div>
          ) : (
            <div className="empty">Selecciona un programa para ver detalles</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramManager;
