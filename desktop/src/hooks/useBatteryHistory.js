import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Hook para obtener historial de batería de un dispositivo
 */
const useBatteryHistory = (deviceId, timeRange = '24h') => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  /**
   * Obtener historial de batería
   */
  const fetchHistory = useCallback(async () => {
    if (!deviceId) return;

    try {
      setLoading(true);
      setError(null);

      // Convertir timeRange a horas
      let hours = 24;
      if (timeRange === '7d') hours = 168;
      if (timeRange === '30d') hours = 720;

      // Obtener historial
      const historyRes = await axios.get(
        `${API_BASE}/devices/${deviceId}/battery/history?hours=${hours}`
      );

      if (historyRes.data.success) {
        // Formatear datos para el gráfico
        const formattedData = historyRes.data.data.map((record) => ({
          timestamp: new Date(record.timestamp),
          level: record.level,
          voltage: record.voltage,
          temperature: record.temperature,
          time: new Date(record.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }));

        setData(formattedData);
        console.log(`✅ Battery history loaded: ${formattedData.length} records`);
      }

      // Obtener estadísticas
      const statsRes = await axios.get(
        `${API_BASE}/devices/${deviceId}/battery/stats?hours=${hours}`
      );

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        console.log('📊 Battery stats:', statsRes.data.stats);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching battery history:', err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  }, [deviceId, timeRange, API_BASE]);

  // Cargar datos al montar o cuando cambien las dependencias
  useEffect(() => {
    fetchHistory();

    // Refetch cada 5 minutos
    const interval = setInterval(fetchHistory, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchHistory]);

  /**
   * Refetch manual
   */
  const refresh = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  /**
   * Obtener predicción de duración
   */
  const getPrediction = useCallback(async () => {
    if (!deviceId) return null;

    try {
      const res = await axios.get(
        `${API_BASE}/devices/${deviceId}/battery/prediction`
      );

      if (res.data.success && res.data.prediction) {
        return res.data.prediction;
      }
      return null;
    } catch (err) {
      console.error('Error getting prediction:', err);
      return null;
    }
  }, [deviceId, API_BASE]);

  return {
    data,
    stats,
    loading,
    error,
    refresh,
    getPrediction,
    timeRange
  };
};

export default useBatteryHistory;
