import { useState, useCallback } from 'react';
import axios from 'axios';

const useProgramSync = (sourceDeviceId) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  const sync = useCallback(async (sourcePrograms, targetDevices, mode = 'overwrite') => {
    if (!sourceDeviceId) {
      setError('Source device required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setStatus('Sincronizando...');

      const res = await axios.post(
        `${API_BASE}/devices/${sourceDeviceId}/programs/sync`,
        {
          sourcePrograms,
          targetDevices,
          mode
        }
      );

      if (res.data.success) {
        setStatus('Completado');

        const syncRecord = {
          id: res.data.syncId,
          timestamp: new Date().toISOString(),
          sourcePrograms: sourcePrograms.length,
          targetDevices: targetDevices.length,
          mode,
          status: 'completed'
        };

        setHistory(prev => [syncRecord, ...prev].slice(0, 5));
        setLoading(false);
        return res.data;
      }
    } catch (err) {
      console.error('Error syncing programs:', err);
      setError(err.response?.data?.error || err.message);
      setStatus('Error');
      setLoading(false);
      return null;
    }
  }, [sourceDeviceId, API_BASE]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    sync,
    loading,
    status,
    history,
    error,
    clearHistory
  };
};

export default useProgramSync;
