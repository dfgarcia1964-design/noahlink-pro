import React from 'react';
import useOfflineMode from '../hooks/useOfflineMode';

const OfflineIndicator = () => {
  const { isOnline, queueLength, clearQueue } = useOfflineMode();

  if (isOnline && queueLength === 0) return null;

  return (
    <div style={{
      padding: '12px 16px',
      backgroundColor: isOnline ? '#fef3c7' : '#fee2e2',
      border: `1px solid ${isOnline ? '#fcd34d' : '#fecaca'}`,
      borderRadius: '6px',
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      fontWeight: '600',
      color: isOnline ? '#92400e' : '#991b1b'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{isOnline ? '⚠️' : '🔌'}</span>
        <div>
          {isOnline && queueLength > 0 ? (
            <span>Sincronizando ({queueLength} operaciones en cola)</span>
          ) : !isOnline ? (
            <span>Modo offline - {queueLength} operaciones en cola</span>
          ) : null}
        </div>
      </div>

      {queueLength > 0 && (
        <button
          onClick={clearQueue}
          style={{
            padding: '4px 8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            textDecoration: 'underline'
          }}
        >
          Limpiar
        </button>
      )}
    </div>
  );
};

export default OfflineIndicator;
