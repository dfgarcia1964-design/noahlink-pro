import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const useAnalyticsData = (deviceIds = [], timeRange = '7d') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  const getDaysFromRange = (range) => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  const fetchAnalyticsData = useCallback(async () => {
    if (!deviceIds || deviceIds.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const days = getDaysFromRange(timeRange);
      const deviceQuery = deviceIds.join(',');

      const res = await axios.get(
        `${API_BASE}/devices/${deviceIds[0]}/analytics/compare?devices=${deviceQuery}`
      );

      if (res.data.success) {
        setData(res.data.data || []);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  }, [deviceIds, timeRange, API_BASE]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const compareDevices = useCallback((ids) => {
    return data.filter((d) => ids.includes(d.deviceId));
  }, [data]);

  const getAverageStats = useCallback((metric) => {
    if (data.length === 0) return 0;

    const values = data.map((d) => {
      const stats = d.usageStats || {};
      return stats[metric] || 0;
    });

    return values.reduce((a, b) => a + b, 0) / values.length;
  }, [data]);

  const getBestDevice = useCallback((metric) => {
    if (data.length === 0) return null;

    let best = data[0];
    data.forEach((d) => {
      const statsB = best.usageStats || {};
      const statsD = d.usageStats || {};
      if (statsD[metric] > statsB[metric]) {
        best = d;
      }
    });

    return best;
  }, [data]);

  const refresh = useCallback(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    data,
    loading,
    error,
    compareDevices,
    getAverageStats,
    getBestDevice,
    refresh,
    timeRange,
    deviceCount: data.length
  };
};

export default useAnalyticsData;
