import { useState, useCallback } from 'react';

const useDeviceManager = (token) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDevices = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/devices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDevices(data.devices || []);
      return data.devices || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addDevice = useCallback(async (deviceData) => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:3000/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deviceData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.device;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  const updateDevice = useCallback(async (deviceId, updates) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:3000/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.device;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  const deleteDevice = useCallback(async (deviceId) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:3000/api/devices/${deviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  return {
    devices,
    loading,
    error,
    fetchDevices,
    addDevice,
    updateDevice,
    deleteDevice
  };
};

export default useDeviceManager;
