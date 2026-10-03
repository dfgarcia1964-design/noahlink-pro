import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const useUsageStats = (deviceId, timeRange = '7d') => {
  const [stats, setStats] = useState(null);
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

  const fetchStats = useCallback(async () => {
    if (!deviceId) return;

    try {
      setLoading(true);
      setError(null);

      const days = getDaysFromRange(timeRange);
      const res = await axios.get(
        `${API_BASE}/devices/${deviceId}/analytics/usage?days=${days}`
      );

      if (res.data.success) {
        setStats(res.data.data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  }, [deviceId, timeRange, API_BASE]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh,
    timeRange
  };
};

export default useUsageStats;
