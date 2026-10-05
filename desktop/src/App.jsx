/**
 * NoahLink Pro - Aplicación Principal
 * Fase 2: Dashboard Mejorado con monitoreo en tiempo real + Sesiones
 */

import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import SessionPanel from './components/SessionPanel';
import useRealDevices from './hooks/useRealDevices';
import useSession from './hooks/useSession';

function App() {
  const { devices, loading, error, mode, updateVolume, updateProgram, getDeviceEvents } = useRealDevices();
  const { session, createSession, endSession } = useSession();
  const [showSessionModal, setShowSessionModal] = useState(!session);

  const handleCreateSession = (username) => {
    createSession(username);
    setShowSessionModal(false);
  };

  return (
    <div>
      {showSessionModal && !session && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '24px' }}>
              👂 Bienvenido a NoahLink Pro
            </h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Ingresa tu nombre para crear una sesión
            </p>
            <input
              type="text"
              placeholder="Tu nombre"
              id="usernameInput"
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '16px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById('usernameInput');
                const username = input.value.trim() || 'Usuario';
                handleCreateSession(username);
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      )}

      {session && (
        <div style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
          <SessionPanel
            session={session}
            onEndSession={() => {
              endSession();
              setShowSessionModal(true);
            }}
          />
        </div>
      )}

      <Dashboard
        devices={devices}
        loading={loading}
        error={error}
        mode={mode}
        onUpdateVolume={updateVolume}
        onUpdateProgram={updateProgram}
        getDeviceEvents={getDeviceEvents}
      />
    </div>
  );
}

export default App;
