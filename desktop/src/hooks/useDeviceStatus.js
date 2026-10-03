import { useEffect, useState, useCallback } from 'react';
import useWebSocket from './useWebSocket';

/**
 * Hook para obtener estado en tiempo real de un dispositivo
 * Usa WebSocket para actualizaciones automáticas
 */
const useDeviceStatus = (deviceId, userId = 'user-001') => {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribe, unsubscribe, on, emit, connected } = useWebSocket();

  // Efecto para suscribirse al dispositivo
  useEffect(() => {
    if (!connected || !deviceId) return;

    setLoading(true);
    subscribe(userId, deviceId);

    return () => {
      unsubscribe(userId, deviceId);
    };
  }, [deviceId, userId, connected, subscribe, unsubscribe]);

  // Escuchar actualizaciones de batería
  useEffect(() => {
    if (!connected) return;

    const unsubscribeBattery = on('battery:update', (data) => {
      if (data.deviceId === deviceId) {
        console.log('🔋 Battery update:', data.battery);
        setDevice((prev) => ({
          ...prev,
          battery: data.battery.level,
          status: data.battery.status,
          statusLabel: data.battery.statusLabel,
          lastSync: data.timestamp
        }));
        setLoading(false);
      }
    });

    return unsubscribeBattery;
  }, [deviceId, connected, on]);

  // Escuchar cambios de estado del dispositivo
  useEffect(() => {
    if (!connected) return;

    const unsubscribeStatus = on('device:status-changed', (data) => {
      if (data.deviceId === deviceId) {
        console.log('🔌 Device status changed:', data.status);
        setDevice((prev) => ({
          ...prev,
          connected: data.status.connected,
          lastSync: data.timestamp
        }));
      }
    });

    return unsubscribeStatus;
  }, [deviceId, connected, on]);

  // Escuchar cambios de programa
  useEffect(() => {
    if (!connected) return;

    const unsubscribeProgram = on('program:changed', (data) => {
      if (data.deviceId === deviceId) {
        console.log('🎵 Program changed:', data.newProgram);
        setDevice((prev) => ({
          ...prev,
          currentProgram: data.newProgram,
          lastSync: data.timestamp
        }));
      }
    });

    return unsubscribeProgram;
  }, [deviceId, connected, on]);

  // Escuchar cambios de volumen
  useEffect(() => {
    if (!connected) return;

    const unsubscribeVolume = on('volume:changed', (data) => {
      if (data.deviceId === deviceId) {
        console.log('🔊 Volume changed:', data.newVolume);
        setDevice((prev) => ({
          ...prev,
          volume: data.newVolume,
          lastSync: data.timestamp
        }));
      }
    });

    return unsubscribeVolume;
  }, [deviceId, connected, on]);

  /**
   * Cambiar volumen
   */
  const updateVolume = useCallback(
    (newVolume) => {
      if (newVolume < 0 || newVolume > 100) {
        setError('El volumen debe estar entre 0 y 100');
        return;
      }

      emit('volume-change', {
        deviceId,
        volume: newVolume
      });

      setDevice((prev) => ({
        ...prev,
        volume: newVolume
      }));
    },
    [deviceId, emit]
  );

  /**
   * Cambiar programa
   */
  const updateProgram = useCallback(
    (programId) => {
      emit('program-switch', {
        deviceId,
        programId
      });

      setDevice((prev) => ({
        ...prev,
        currentProgram: programId
      }));
    },
    [deviceId, emit]
  );

  /**
   * Solicitar actualización de batería
   */
  const refreshBattery = useCallback(() => {
    emit('request-battery-update', { deviceId });
  }, [deviceId, emit]);

  return {
    device,
    loading,
    error,
    updateVolume,
    updateProgram,
    refreshBattery,
    connected
  };
};

export default useDeviceStatus;
