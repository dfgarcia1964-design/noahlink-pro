import React, { useState } from 'react';

const SecuritySettings = ({ user }) => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          currentPassword: password,
          newPassword: newPassword
        })
      });

      if (response.ok) {
        setMessage('✅ Contraseña actualizada exitosamente');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('¿Cerrar sesión en todos los dispositivos?')) return;

    try {
      const response = await fetch('http://localhost:3000/api/auth/logout-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        setMessage('✅ Sesión cerrada en todos los dispositivos');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    } catch (error) {
      setMessage('❌ Error al cerrar sesión');
    }
  };

  return (
    <div style={{
      backgroundColor: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #334155',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '700', color: '#f1f5f9' }}>
        🔒 Seguridad
      </h2>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#e2e8f0' }}>
          Cambiar Contraseña
        </h3>

        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
              Contraseña Actual
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
              Nueva Contraseña
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
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

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
              Confirmar Contraseña
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
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

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', marginBottom: '16px' }}>
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Mostrar contraseñas
          </label>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: saving ? '#64748b' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '700',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              marginBottom: '12px'
            }}
          >
            {saving ? '⏳ Actualizando...' : '🔐 Actualizar Contraseña'}
          </button>
        </form>
      </div>

      <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #334155' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#e2e8f0' }}>
          Sesiones
        </h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#cbd5e1' }}>
          Última conexión: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}
        </p>
        <button
          onClick={handleLogoutAllDevices}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#7f1d1d',
            color: '#fecaca',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🚪 Cerrar Sesión en Todos los Dispositivos
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '6px',
          backgroundColor: message.includes('❌') ? '#7f1d1d' : '#064e3b',
          color: message.includes('❌') ? '#fecaca' : '#86efac',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
