import React, { useState } from 'react';
import '../styles/UserProfiles.css';

const UserProfiles = () => {
  const [profiles, setProfiles] = useState([
    { id: 1, name: 'Perfil Principal', device: 'Naída UP 90', programs: 5, active: true, createdDate: '2026-01-15' },
    { id: 2, name: 'Oficina', device: 'Naída UP 90', programs: 3, active: false, createdDate: '2026-02-20' },
    { id: 3, name: 'Recreo', device: 'Naída UP 90', programs: 2, active: false, createdDate: '2026-03-10' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: '', programs: 0 });

  const handleAddProfile = () => {
    if (newProfile.name.trim()) {
      const profile = {
        id: Math.max(...profiles.map(p => p.id)) + 1,
        name: newProfile.name,
        device: 'Naída UP 90',
        programs: newProfile.programs || 0,
        active: false,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setProfiles([...profiles, profile]);
      setNewProfile({ name: '', programs: 0 });
      setShowForm(false);
    }
  };

  const handleSetActive = (id) => {
    setProfiles(profiles.map(p => ({ ...p, active: p.id === id })));
  };

  const handleDeleteProfile = (id) => {
    setProfiles(profiles.filter(p => p.id !== id));
  };

  return (
    <div className="user-profiles">
      <div className="profiles-header">
        <h2>👤 Perfiles de Usuario</h2>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '➕'} Nuevo Perfil
        </button>
      </div>

      {showForm && (
        <div className="profile-form">
          <input
            type="text"
            placeholder="Nombre del perfil"
            value={newProfile.name}
            onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
            className="form-input"
          />
          <input
            type="number"
            min="0"
            max="10"
            placeholder="Cantidad de programas"
            value={newProfile.programs}
            onChange={(e) => setNewProfile({ ...newProfile, programs: parseInt(e.target.value) })}
            className="form-input"
          />
          <div className="form-actions">
            <button className="btn primary" onClick={handleAddProfile}>Crear</button>
            <button className="btn secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="profiles-grid">
        {profiles.map(profile => (
          <div key={profile.id} className={`profile-card ${profile.active ? 'active' : ''}`}>
            <div className="profile-badge">
              {profile.active && <span className="active-indicator">✓ ACTIVO</span>}
            </div>
            <div className="profile-content">
              <h3>{profile.name}</h3>
              <div className="profile-details">
                <p><span className="label">Dispositivo:</span> {profile.device}</p>
                <p><span className="label">Programas:</span> {profile.programs}</p>
                <p><span className="label">Creado:</span> {profile.createdDate}</p>
              </div>
            </div>
            <div className="profile-actions">
              {!profile.active && (
                <button className="btn-action" onClick={() => handleSetActive(profile.id)} title="Usar este perfil">
                  📌 Activar
                </button>
              )}
              <button className="btn-action edit" title="Editar perfil">
                ✎ Editar
              </button>
              {profiles.length > 1 && !profile.active && (
                <button className="btn-action delete" onClick={() => handleDeleteProfile(profile.id)} title="Eliminar perfil">
                  🗑️ Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="profiles-stats">
        <div className="stat">
          <div className="stat-value">{profiles.length}</div>
          <div className="stat-label">Perfiles Totales</div>
        </div>
        <div className="stat">
          <div className="stat-value">{profiles.reduce((a, p) => a + p.programs, 0)}</div>
          <div className="stat-label">Programas</div>
        </div>
        <div className="stat">
          <div className="stat-value">{profiles.filter(p => p.active).length}</div>
          <div className="stat-label">Activos</div>
        </div>
      </div>
    </div>
  );
};

export default UserProfiles;
