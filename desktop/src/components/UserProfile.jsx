import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';

const UserProfile = ({ user, onSave }) => {
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [theme, setTheme] = useState(user?.preferences?.theme || 'dark');
  const [language, setLanguage] = useState(user?.preferences?.language || 'es');
  const [notifications, setNotifications] = useState(user?.preferences?.notifications !== false);
  const [autoSync, setAutoSync] = useState(user?.preferences?.autoSync !== false);
  const [saving, setSaving] = useState(false);

  const { updateProfile } = useAuth();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        preferences: {
          theme,
          language,
          notifications,
          autoSync
        }
      });
      onSave?.();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: '#1e293b',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #334155'
      }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '700', color: '#f1f5f9' }}>
          👤 Mi Perfil
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', fontWeight: '600' }}>
              Nombre
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#0f172a',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: '#f1f5f9',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', fontWeight: '600' }}>
              Apellido
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#0f172a',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: '#f1f5f9',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', fontWeight: '600' }}>
            Tema
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#0f172a',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: '#f1f5f9',
              fontSize: '14px'
            }}
          >
            <option value="light">☀️ Claro</option>
            <option value="dark">🌙 Oscuro</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', fontWeight: '600' }}>
            Idioma
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#0f172a',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: '#f1f5f9',
              fontSize: '14px'
            }}
          >
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇬🇧 English</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="fr">🇫🇷 Français</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#cbd5e1', fontWeight: '600' }}>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            🔔 Notificaciones
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#cbd5e1', fontWeight: '600' }}>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            🔄 Sincronización Automática
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: saving ? '#64748b' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '700',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
