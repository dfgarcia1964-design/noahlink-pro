import React, { useEffect, useState } from 'react';
import useWebSocketPool from '../hooks/useWebSocketPool';

const ConnectionMonitor = () => {
  const { connected, getStats } = useWebSocketPool();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStats());
    }, 1000);
    return () => clearInterval(interval);
  }, [getStats]);

  return (
    <div style={{
      padding: '12px 16px',
      backgroundColor: connected ? '#dcfce7' : '#fee2e2',
      border: `1px solid ${connected ? '#86efac' : '#fecaca'}`,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      fontWeight: '600',
      color: connected ? '#166534' : '#991b1b'
    }}>
      <span>{connected ? '🟢' : '🔴'}</span>
      <span>{connected ? 'Conectado' : 'Desconectado'}</span>
      {stats && <span>({stats.reconnectAttempts} reconexiones)</span>}
    </div>
  );
};

export default ConnectionMonitor;
