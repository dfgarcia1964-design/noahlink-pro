import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';

const useWebSocketPool = (maxConnections = 10) => {
  const [connected, setConnected] = useState(false);
  const [connectionStats, setConnectionStats] = useState(null);
  const socketRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatRef = useRef(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.hostname}:3000`;

    socketRef.current = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      reconnectAttemptsRef.current = 0;
      startHeartbeat();
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    });

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = setInterval(() => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('heartbeat', { timestamp: Date.now() });
      }
    }, 30000);
  }, []);

  const getStats = useCallback(() => {
    return {
      connected,
      reconnectAttempts: reconnectAttemptsRef.current,
      socketId: socketRef.current?.id || null
    };
  }, [connected]);

  return {
    socket: socketRef.current,
    connected,
    getStats,
    reconnectAttempts: reconnectAttemptsRef.current
  };
};

export default useWebSocketPool;
