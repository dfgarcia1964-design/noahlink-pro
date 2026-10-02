import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CustomProgramEditor.css';

const CustomProgramEditor = ({ deviceId = 'sky-l-90-up-left' }) => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [editMode, setEditMode] = useState('view'); // view, create, edit
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availablePrograms, setAvailablePrograms] = useState([]);

  // Load custom programs on mount
  useEffect(() => {
    fetchCustomPrograms();
    fetchAvailablePrograms();
  }, [deviceId]);

  const fetchCustomPrograms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/v1/devices/${deviceId}/custom-programs`
      );
      setPrograms(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching custom programs:', err);
      setError('No se pudieron cargar los programas personalizados');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePrograms = async () => {
    try {
      const response = await axios.get('/api/v1/programs');
      setAvailablePrograms(response.data.data || []);
    } catch (err) {
      console.error('Error fetching available programs:', err);
    }
  };

  const handleCreateNew = () => {
    setFormData({
      name: 'Mi Programa',
      description: '',
      icon: '🎨',
      frequency: [100, 500, 1000, 2000, 4000, 8000],
      gain: [10, 10, 10, 10, 10, 10]
    });
    setEditMode('create');
    setSelectedProgram(null);
  };

  const handleDuplicate = async (sourceId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `/api/v1/devices/${deviceId}/custom-programs/${sourceId}/duplicate`
      );
      setPrograms([...programs, response.data.program]);
      setError(null);
    } catch (err) {
      console.error('Error duplicating program:', err);
      setError('Error al duplicar programa');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (editMode === 'create') {
        const response = await axios.post(
          `/api/v1/devices/${deviceId}/custom-programs`,
          formData
        );
        setPrograms([...programs, response.data.program]);
      } else if (editMode === 'edit' && selectedProgram) {
        const response = await axios.put(
          `/api/v1/devices/${deviceId}/custom-programs/${selectedProgram.id}`,
          formData
        );
        setPrograms(programs.map(p => p.id === selectedProgram.id ? response.data.program : p));
        setSelectedProgram(response.data.program);
      }

      setEditMode('view');
      setFormData(null);
      setError(null);
    } catch (err) {
      console.error('Error saving program:', err);
      setError(err.response?.data?.errors?.join(', ') || 'Error al guardar programa');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar programa "${selectedProgram.name}"?`)) return;

    try {
      setLoading(true);
      await axios.delete(
        `/api/v1/devices/${deviceId}/custom-programs/${selectedProgram.id}`
      );
      setPrograms(programs.filter(p => p.id !== selectedProgram.id));
      setSelectedProgram(null);
      setEditMode('view');
    } catch (err) {
      console.error('Error deleting program:', err);
      setError('Error al eliminar programa');
    } finally {
      setLoading(false);
    }
  };

  const handleGainChange = (index, value) => {
    const newGain = [...formData.gain];
    newGain[index] = Math.max(0, Math.min(25, parseInt(value) || 0));
    setFormData({ ...formData, gain: newGain });
  };

  return (
    <div className="custom-program-editor">
      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="close">✕</button>
        </div>
      )}

      <div className="grid-2col">
        {/* Programs List */}
        <div className="programs-panel">
          <h3>🎨 Mis Programas</h3>
          <button className="btn primary" onClick={handleCreateNew} disabled={loading}>
            ➕ Nuevo Programa
          </button>

          <div className="programs-list">
            {programs.length > 0 ? (
              programs.map(program => (
                <div
                  key={program.id}
                  className={`program-item ${selectedProgram?.id === program.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedProgram(program);
                    setEditMode('view');
                    setFormData(null);
                  }}
                >
                  <span className="icon">{program.icon}</span>
                  <div className="info">
                    <div className="name">{program.name}</div>
                    <div className="desc">{program.description || 'Sin descripción'}</div>
                  </div>
                  {program.isActive && <span className="active">✓ Activo</span>}
                </div>
              ))
            ) : (
              <div className="empty">📭 No hay programas personalizados</div>
            )}
          </div>

          <div className="section">
            <h4>Programas Disponibles</h4>
            <div className="available-programs">
              {availablePrograms.map(program => (
                <button
                  key={program.id}
                  className="btn secondary small"
                  onClick={() => handleDuplicate(program.id)}
                  title="Duplicar como base"
                >
                  {program.icon} {program.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="editor-panel">
          {editMode === 'view' && selectedProgram ? (
            <div className="view-mode">
              <div className="header">
                <span className="icon">{selectedProgram.icon}</span>
                <div>
                  <h3>{selectedProgram.name}</h3>
                  <p>{selectedProgram.description}</p>
                </div>
              </div>

              <div className="frequencies">
                <h4>Respuesta de Frecuencia</h4>
                <div className="frequency-grid">
                  {selectedProgram.frequency.map((freq, idx) => (
                    <div key={idx} className="frequency-item view">
                      <label>{freq}Hz</label>
                      <div className="gain-bar">
                        <div
                          className="gain-fill"
                          style={{ height: `${(selectedProgram.gain[idx] / 25) * 100}%` }}
                        />
                      </div>
                      <span className="value">{selectedProgram.gain[idx]}dB</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="actions">
                <button
                  className="btn primary"
                  onClick={() => {
                    setEditMode('edit');
                    setFormData(selectedProgram);
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn secondary"
                  onClick={() => handleDuplicate(selectedProgram.id)}
                >
                  📋 Duplicar
                </button>
                <button className="btn danger" onClick={handleDelete}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ) : (editMode === 'create' || editMode === 'edit') && formData ? (
            <div className="edit-mode">
              <h3>{editMode === 'create' ? 'Nuevo Programa' : 'Editar Programa'}</h3>

              <div className="form-group">
                <label>Nombre del Programa</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Mi Programa Personalizado"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe tu programa..."
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Icono</label>
                <div className="icon-picker">
                  {['🎨', '🎵', '🔊', '🎤', '🌳', '👂'].map(icon => (
                    <button
                      key={icon}
                      className={`icon-btn ${formData.icon === icon ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Ajustar Ganancia por Frecuencia (dB)</label>
                <div className="frequency-grid">
                  {formData.frequency.map((freq, idx) => (
                    <div key={idx} className="frequency-item edit">
                      <label>{freq}Hz</label>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={formData.gain[idx]}
                        onChange={(e) => handleGainChange(idx, e.target.value)}
                        className="slider"
                      />
                      <div className="gain-display">
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={formData.gain[idx]}
                          onChange={(e) => handleGainChange(idx, e.target.value)}
                          className="gain-input"
                        />
                        <span>dB</span>
                      </div>
                      <div className="gain-bar">
                        <div
                          className="gain-fill"
                          style={{ height: `${(formData.gain[idx] / 25) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="actions">
                <button className="btn primary" onClick={handleSave} disabled={loading}>
                  💾 Guardar
                </button>
                <button
                  className="btn secondary"
                  onClick={() => {
                    setEditMode('view');
                    setFormData(null);
                  }}
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>📋 Selecciona un programa o crea uno nuevo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomProgramEditor;
