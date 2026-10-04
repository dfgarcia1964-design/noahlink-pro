import React from 'react';
import useCloudSync from '../hooks/useCloudSync';

const SyncStatus = ({ token }) => {
  const { syncStatus, processSyncQueue, clearFailedItems } = useCloudSync(token);

  const getIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'syncing': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  return (
    <div style={{
      backgroundColor: '#1e293b',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #334155',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#f1f5f9' }}>📡 Estado de Sincronización</h3>
        <button
          onClick={processSyncQueue}
          style={{
            padding: '6px 12px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔄 Sincronizar Ahora
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <div style={{ backgroundColor: '#0f172a', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Pendiente</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#fbbf24' }}>{getIcon('pending')} {syncStatus.pending}</div>
        </div>
        <div style={{ backgroundColor: '#0f172a', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Sincronizando</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>{getIcon('syncing')} {syncStatus.syncing}</div>
        </div>
        <div style={{ backgroundColor: '#0f172a', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Completado</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e' }}>{getIcon('completed')} {syncStatus.completed}</div>
        </div>
        <div style={{ backgroundColor: '#0f172a', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Fallido</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444' }}>{getIcon('failed')} {syncStatus.failed}</div>
        </div>
      </div>

      {syncStatus.failed > 0 && (
        <button
          onClick={clearFailedItems}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#7f1d1d',
            color: '#fecaca',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🗑️ Limpiar Elementos Fallidos
        </button>
      )}
    </div>
  );
};

export default SyncStatus;
