import { useEffect, useState, useCallback, useRef } from 'react';
import io from 'socket.io-client';

/**
 * Hook para gestionar conexión WebSocket con el servidor
 * Conecta a ws://localhost:3000 en desarrollo
 */
const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const subscribedDevices = useRef(new Set());
  const listenersRef = useRef({});

  // Conectar al servidor WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = 3000; // Backend port

    const url = `${protocol}//${host}:${port}`;

    try {
      socketRef.current = io(url, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      socketRef.current.on('connect', () => {
        console.log('✅ WebSocket conectado');
        setConnected(true);
        setError(null);
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ WebSocket desconectado');
        setConnected(false);
      });

      socketRef.current.on('error', (err) => {
        console.error('❌ WebSocket error:', err);
        setError(err.message || 'WebSocket error');
      });

      socketRef.current.on('connected', (data) => {
        console.log('ℹ️  Servidor confirmó conexión:', data);
      });
    } catch (err) {
      console.error('Error iniciando WebSocket:', err);
      setError(err.message);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  /**
   * Suscribirse a un dispositivo
   */
  const subscribe = useCallback((userId, deviceId) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn('WebSocket no conectado');
      return;
    }

    socketRef.current.emit('join-device', { userId, deviceId });
    subscribedDevices.current.add(deviceId);
    console.log(`✅ Suscrito a dispositivo: ${deviceId}`);
  }, []);

  /**
   * Desuscribirse de un dispositivo
   */
  const unsubscribe = useCallback((userId, deviceId) => {
    if (!socketRef.current) return;

    socketRef.current.emit('leave-device', { userId, deviceId });
    subscribedDevices.current.delete(deviceId);
    console.log(`❌ Desuscrito de dispositivo: ${deviceId}`);
  }, []);

  /**
   * Registrar escuchador de evento
   */
  const on = useCallback((event, callback) => {
    if (!socketRef.current) {
      console.warn('WebSocket no inicializado');
      return;
    }

    if (!listenersRef.current[event]) {
      listenersRef.current[event] = [];
    }

    listenersRef.current[event].push(callback);
    socketRef.current.on(event, callback);

    // Retornar función para desregistrar
    return () => {
      socketRef.current.off(event, callback);
      listenersRef.current[event] = listenersRef.current[event].filter(
        (cb) => cb !== callback
      );
    };
  }, []);

  /**
   * Emitir evento al servidor
   */
  const emit = useCallback((event, data) => {
    if (!socketRef.current) {
      console.warn('WebSocket no conectado');
      return;
    }

    socketRef.current.emit(event, data);
  }, []);

  /**
   * Solicitar actualización de batería
   */
  const requestBatteryUpdate = useCallback((deviceId) => {
    if (!socketRef.current) return;

    socketRef.current.emit('request-battery-update', { deviceId });
  }, []);

  /**
   * Obtener estado de conexión
   */
  const getConnectionStatus = useCallback(() => {
    return {
      connected,
      subscribed: Array.from(subscribedDevices.current),
      error
    };
  }, [connected, error]);

  return {
    connected,
    error,
    subscribe,
    unsubscribe,
    on,
    emit,
    requestBatteryUpdate,
    getConnectionStatus,
    socket: socketRef.current
  };
};

export default useWebSocket;
