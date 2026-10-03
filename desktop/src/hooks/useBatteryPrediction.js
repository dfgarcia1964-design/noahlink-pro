import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import useWebSocket from './useWebSocket';

const useBatteryPrediction = (deviceId, userId = 'user-001') => {
  const [prediction, setPrediction] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { connected, on } = useWebSocket();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  const fetchPrediction = useCallback(async () => {
    if (!deviceId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${API_BASE}/devices/${deviceId}/analytics/prediction`
      );

      if (res.data.success) {
        setPrediction(res.data.data);
        setTrend(res.data.data.projection || []);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching battery prediction:', err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  }, [deviceId, API_BASE]);

  useEffect(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = on('battery:update', (data) => {
      if (data.deviceId === deviceId) {
        setPrediction((prev) => prev ? {
          ...prev,
          currentBattery: data.battery.level
        } : null);
      }
    });

    return unsubscribe;
  }, [deviceId, connected, on]);

  const refresh = useCallback(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  const getStatus = useCallback(() => {
    if (!prediction) return 'Unknown';
    if (prediction.hoursRemaining === null) return 'N/A';
    if (prediction.hoursRemaining < 4) return 'Crítico';
    if (prediction.hoursRemaining < 12) return 'Bajo';
    if (prediction.hoursRemaining < 24) return 'Moderado';
    return 'Bueno';
  }, [prediction]);

  return {
    prediction,
    trend,
    loading,
    error,
    refresh,
    getStatus,
    accuracy: prediction?.accuracy || 0,
    confidence: prediction?.confidence || 'Desconocida'
  };
};

export default useBatteryPrediction;
