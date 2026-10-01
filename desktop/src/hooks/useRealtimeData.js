import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for real-time device data polling
 * Polls API endpoints at configurable intervals for live updates
 */
export const useRealtimeData = (deviceId, pollInterval = 5000) => {
  const [battery, setBattery] = useState(null);
  const [volume, setVolume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    if (!deviceId) return;

    setLoading(true);
    try {
      // Fetch battery data
      const batteryResponse = await axios.get(
        `/api/v1/devices/${deviceId}/battery`
      );
      if (batteryResponse.data) {
        setBattery(batteryResponse.data);
      }

      // Fetch volume data
      const volumeResponse = await axios.get(
        `/api/v1/devices/${deviceId}/volume`
      );
      if (volumeResponse.data) {
        setVolume(volumeResponse.data);
      }

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching realtime data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  // Fetch data on mount and setup polling
  useEffect(() => {
    // Fetch immediately
    fetchData();

    // Setup polling interval
    const interval = setInterval(fetchData, pollInterval);

    return () => clearInterval(interval);
  }, [deviceId, pollInterval, fetchData]);

  return {
    battery,
    volume,
    loading,
    error,
    lastUpdate,
    refetch: fetchData
  };
};

/**
 * Hook for battery history data
 */
export const useBatteryHistory = (deviceId, hours = 24) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!deviceId) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `/api/v1/devices/${deviceId}/battery/history?hours=${hours}`
        );

        if (response.data.data) {
          setHistory(response.data.data);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching battery history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // Refetch every 60 seconds
    const interval = setInterval(fetchHistory, 60000);
    return () => clearInterval(interval);
  }, [deviceId, hours]);

  return { history, loading, error };
};
