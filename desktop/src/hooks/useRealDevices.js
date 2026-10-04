import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3000';

let globalSocket = null;
let globalDevices = [];

const useRealDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('LOADING');

  // Fetch devices from backend
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/devices`);
      if (!response.ok) throw new Error('Failed to fetch devices');
      const data = await response.json();

      const fetchedDevices = data.devices || [];
      globalDevices = fetchedDevices;
      setDevices(fetchedDevices);
      setError(null);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError(err.message);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  // Check app mode (REAL or DEMO)
  const checkMode = async () => {
    try {
      const response = await fetch(`${API_URL}/api/status/mode`);
      if (response.ok) {
        const data = await response.json();
        setMode(data.mode || 'UNKNOWN');
      }
    } catch (err) {
      console.error('Error checking mode:', err);
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    // Fetch initial devices
    fetchDevices();
    checkMode();

    // Connect to WebSocket
    if (!globalSocket) {
      globalSocket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      globalSocket.on('connect', () => {
        console.log('✓ WebSocket connected');
        fetchDevices();
        checkMode();
      });

      globalSocket.on('disconnect', () => {
        console.log('⚠️  WebSocket disconnected');
      });

      // Listen for device updates
      globalSocket.on('device:updated', (updatedDevice) => {
        const updated = globalDevices.map(d =>
          d.id === updatedDevice.id ? { ...d, ...updatedDevice } : d
        );
        globalDevices = updated;
        setDevices([...updated]);
      });

      globalSocket.on('device:connected', (connectedDevice) => {
        const existing = globalDevices.find(d => d.id === connectedDevice.id);
        if (!existing) {
          globalDevices = [...globalDevices, connectedDevice];
          setDevices([...globalDevices]);
        }
      });

      globalSocket.on('device:disconnected', (deviceId) => {
        globalDevices = globalDevices.filter(d => d.id !== deviceId);
        setDevices([...globalDevices]);
      });
    }

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, []);

  // Update volume
  const updateVolume = async (deviceId, volume) => {
    try {
      const response = await fetch(`${API_URL}/api/device/${deviceId}/volume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume })
      });

      if (!response.ok) throw new Error('Failed to update volume');

      const result = await response.json();

      // Update local state
      const updated = globalDevices.map(d =>
        d.id === deviceId ? { ...d, volume } : d
      );
      globalDevices = updated;
      setDevices([...updated]);

      // Emit event via WebSocket
      if (globalSocket) {
        globalSocket.emit('device:volume-changed', { deviceId, volume });
      }

      return result;
    } catch (err) {
      console.error('Error updating volume:', err);
      throw err;
    }
  };

  // Update program
  const updateProgram = async (deviceId, program) => {
    try {
      const response = await fetch(`${API_URL}/api/device/${deviceId}/program`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ program })
      });

      if (!response.ok) throw new Error('Failed to update program');

      const result = await response.json();

      // Update local state
      const updated = globalDevices.map(d =>
        d.id === deviceId ? { ...d, program } : d
      );
      globalDevices = updated;
      setDevices([...updated]);

      // Emit event via WebSocket
      if (globalSocket) {
        globalSocket.emit('device:program-changed', { deviceId, program });
      }

      return result;
    } catch (err) {
      console.error('Error updating program:', err);
      throw err;
    }
  };

  // Get device events
  const getDeviceEvents = async (deviceId) => {
    try {
      const response = await fetch(`${API_URL}/api/device/${deviceId}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      return data.events || [];
    } catch (err) {
      console.error('Error fetching events:', err);
      return [];
    }
  };

  return {
    devices,
    loading,
    error,
    mode,
    updateVolume,
    updateProgram,
    getDeviceEvents,
    fetchDevices,
    checkMode
  };
};

export default useRealDevices;
