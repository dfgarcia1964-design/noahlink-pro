import { useEffect, useState, useCallback } from 'react';
import useWebSocketPool from './useWebSocketPool';
import useOfflineMode from './useOfflineMode';

const useConnectionMonitor = () => {
  const { connected, getStats } = useWebSocketPool();
  const { isOnline, queueLength } = useOfflineMode();
  const [connectionStats, setConnectionStats] = useState({
    connected: false,
    isOnline: true,
    latency: 0,
    reconnectAttempts: 0,
    offlineQueueLength: 0,
    connectionHealth: 'unknown'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const wsStats = getStats();
      setConnectionStats(prev => ({
        ...prev,
        connected,
        isOnline,
        reconnectAttempts: wsStats.reconnectAttempts,
        offlineQueueLength: queueLength,
        connectionHealth: connected && isOnline ? 'healthy' : connected ? 'degraded' : 'offline',
        timestamp: Date.now()
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [connected, isOnline, queueLength, getStats]);

  const getConnectionStatus = useCallback(() => {
    return {
      ...connectionStats,
      isHealthy: connectionStats.connectionHealth === 'healthy',
      isDegraded: connectionStats.connectionHealth === 'degraded',
      isOffline: connectionStats.connectionHealth === 'offline'
    };
  }, [connectionStats]);

  const getStatusColor = useCallback(() => {
    switch (connectionStats.connectionHealth) {
      case 'healthy':
        return '#22c55e';
      case 'degraded':
        return '#f59e0b';
      case 'offline':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }, [connectionStats.connectionHealth]);

  const getStatusIcon = useCallback(() => {
    switch (connectionStats.connectionHealth) {
      case 'healthy':
        return '🟢';
      case 'degraded':
        return '🟡';
      case 'offline':
        return '🔴';
      default:
        return '⚪';
    }
  }, [connectionStats.connectionHealth]);

  return {
    ...connectionStats,
    getConnectionStatus,
    getStatusColor,
    getStatusIcon
  };
};

export default useConnectionMonitor;
