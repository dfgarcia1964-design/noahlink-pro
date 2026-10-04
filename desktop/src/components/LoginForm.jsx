import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0f172a'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        padding: '32px',
        borderRadius: '12px',
        border: '1px solid #334155',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ margin: '0 0 24px 0', fontSize: '28px', fontWeight: '700', color: '#f1f5f9', textAlign: 'center' }}>
          🎵 NoahLink Pro
        </h1>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', fontWeight: '600' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', fontWeight: '600' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#7f1d1d',
              color: '#fecaca',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '12px'
            }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#64748b' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? '⏳ Iniciando sesión...' : '🔓 Iniciar Sesión'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          ¿No tienes cuenta? Usa la opción de Registro
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
