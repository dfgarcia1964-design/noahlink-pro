import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

/**
 * useBLEControl Hook - Phase 2: Control BLE real de audífonos Phonak
 * Proporciona:
 * - Escaneo de dispositivos BLE
 * - Conexión/desconexión a audífonos
 * - Control de volumen y programa
 * - Notificaciones de batería en tiempo real
 * - Eventos WebSocket
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3000';

export default function useBLEControl() {
  const [status, setStatus] = useState({
    isScanning: false,
    connected: false,
    activeDevice: null,
    volume: 50,
    program: 'Automático',
    battery: 100
  });

  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Inicializar WebSocket
  useEffect(() => {
    const newSocket = io(WS_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado');
    });

    newSocket.on('ble-device-discovered', (device) => {
      console.log('📱 Dispositivo BLE descubierto:', device);
      setDiscoveredDevices(prev => {
        const filtered = prev.filter(d => d.id !== device.id);
        return [...filtered, device];
      });
    });

    newSocket.on('ble-device-connected', (device) => {
      console.log('🔌 Dispositivo BLE conectado:', device);
      setStatus(prev => ({ ...prev, connected: true, activeDevice: device.id }));
      updateConnectedDevices();
    });

    newSocket.on('ble-device-disconnected', (device) => {
      console.log('❌ Dispositivo BLE desconectado:', device);
      setStatus(prev => ({ ...prev, connected: false, activeDevice: null }));
      updateConnectedDevices();
    });

    newSocket.on('ble-volume-changed', (data) => {
      console.log('🔊 Volumen cambiado:', data.volume);
      setStatus(prev => ({ ...prev, volume: data.volume }));
    });

    newSocket.on('ble-program-changed', (data) => {
      console.log('📻 Programa cambiado:', data.program);
      setStatus(prev => ({ ...prev, program: data.program }));
    });

    newSocket.on('ble-battery-updated', (data) => {
      if (data.deviceId === status.activeDevice) {
        setStatus(prev => ({ ...prev, battery: data.battery }));
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [status.activeDevice]);

  // Obtener estado del sistema BLE
  const getStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/ble-control/status`);
      return response.data.status;
    } catch (err) {
      console.error('Error obteniendo estado:', err);
      throw err;
    }
  }, []);

  // Iniciar escaneo de dispositivos
  const startScan = useCallback(async (duration = 10000) => {
    try {
      setLoading(true);
      setError(null);
      setStatus(prev => ({ ...prev, isScanning: true }));

      const response = await axios.post(`${API_URL}/api/ble-control/scan`, { duration });

      console.log('🔍 Escaneo iniciado');

      // Esperar a que se complete el escaneo
      setTimeout(() => {
        updateDiscoveredDevices();
      }, duration);

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error iniciando escaneo:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
      setStatus(prev => ({ ...prev, isScanning: false }));
    }
  }, []);

  // Detener escaneo
  const stopScan = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/api/ble-control/stop-scan`);
      console.log('✅ Escaneo detenido');
      await updateDiscoveredDevices();
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error deteniendo escaneo:', errorMsg);
      throw err;
    }
  }, []);

  // Actualizar lista de dispositivos descubiertos
  const updateDiscoveredDevices = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/ble-control/discovered`);
      setDiscoveredDevices(response.data.devices || []);
    } catch (err) {
      console.error('Error actualizando dispositivos descubiertos:', err);
    }
  }, []);

  // Actualizar lista de dispositivos conectados
  const updateConnectedDevices = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/ble-control/connected`);
      setConnectedDevices(response.data.devices || []);
    } catch (err) {
      console.error('Error actualizando dispositivos conectados:', err);
    }
  }, []);

  // Conectar a dispositivo
  const connect = useCallback(async (deviceId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/ble-control/connect/${deviceId}`);

      console.log('🔌 Conectado a:', response.data.device);

      setStatus(prev => ({
        ...prev,
        connected: true,
        activeDevice: deviceId
      }));

      await updateConnectedDevices();

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error conectando:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateConnectedDevices]);

  // Desconectar de dispositivo
  const disconnect = useCallback(async (deviceId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/ble-control/disconnect/${deviceId}`);

      console.log('❌ Desconectado');

      setStatus(prev => ({
        ...prev,
        connected: false,
        activeDevice: null
      }));

      await updateConnectedDevices();

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error desconectando:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateConnectedDevices]);

  // Establecer volumen
  const setVolume = useCallback(async (deviceId, volume) => {
    try {
      setError(null);

      if (volume < 0 || volume > 100) {
        throw new Error('Volumen debe estar entre 0-100');
      }

      const response = await axios.post(
        `${API_URL}/api/ble-control/volume/${deviceId}`,
        { volume }
      );

      console.log(`🔊 Volumen establecido: ${volume}%`);

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error estableciendo volumen:', errorMsg);
      throw err;
    }
  }, []);

  // Cambiar programa
  const setProgram = useCallback(async (deviceId, program) => {
    try {
      setError(null);

      const response = await axios.post(
        `${API_URL}/api/ble-control/program/${deviceId}`,
        { program }
      );

      console.log(`📻 Programa cambiado: ${program}`);

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error cambiando programa:', errorMsg);
      throw err;
    }
  }, []);

  return {
    // Estado
    status,
    discoveredDevices,
    connectedDevices,
    loading,
    error,

    // Métodos
    getStatus,
    startScan,
    stopScan,
    connect,
    disconnect,
    setVolume,
    setProgram,
    updateDiscoveredDevices,
    updateConnectedDevices
  };
}
