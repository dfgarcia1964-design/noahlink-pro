import React from 'react';

const SessionPanel = ({ session, username, onEndSession }) => {
  if (!session) {
    return (
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#fef3c7',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#92400e',
        border: '1px solid #fcd34d'
      }}>
        ⏳ Iniciando sesión...
      </div>
    );
  }

  return (
    <div style={{
      padding: '12px 16px',
      backgroundColor: '#f0fdf4',
      borderRadius: '6px',
      fontSize: '12px',
      color: '#166534',
      border: '1px solid #86efac',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{ fontWeight: '600' }}>👤 {session.username}</div>
        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
          Sesión ID: {session.id.substr(-8)}
        </div>
      </div>
      <button
        onClick={onEndSession}
        style={{
          padding: '6px 12px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: '600'
        }}
      >
        🚪 Cerrar Sesión
      </button>
    </div>
  );
};

export default SessionPanel;
