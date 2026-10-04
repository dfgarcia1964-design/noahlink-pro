import { useState, useCallback, useEffect } from 'react';

const useCloudSync = (token) => {
  const [syncStatus, setSyncStatus] = useState({
    pending: 0,
    syncing: 0,
    failed: 0,
    completed: 0
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchSyncStatus = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:3000/api/sync/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  }, [token]);

  const processSyncQueue = useCallback(async () => {
    if (!token || isSyncing) return;
    setIsSyncing(true);
    try {
      const response = await fetch('http://localhost:3000/api/sync/process', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        await fetchSyncStatus();
      }
      return data;
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [token, isSyncing, fetchSyncStatus]);

  const addToSyncQueue = useCallback(async (deviceId, operation, priority = 5) => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:3000/api/sync/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deviceId, operation, priority })
      });
      const data = await response.json();
      if (response.ok) {
        await fetchSyncStatus();
      }
      return data;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }, [token, fetchSyncStatus]);

  const clearFailedItems = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:3000/api/sync/clear-failed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        await fetchSyncStatus();
      }
      return data;
    } catch (error) {
      console.error('Error clearing failed items:', error);
    }
  }, [token, fetchSyncStatus]);

  const resyncDevice = useCallback(async (deviceId) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:3000/api/sync/resync-device/${deviceId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        await fetchSyncStatus();
      }
      return data;
    } catch (error) {
      console.error('Error resyncing device:', error);
    }
  }, [token, fetchSyncStatus]);

  useEffect(() => {
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchSyncStatus]);

  return {
    syncStatus,
    isSyncing,
    fetchSyncStatus,
    processSyncQueue,
    addToSyncQueue,
    clearFailedItems,
    resyncDevice
  };
};

export default useCloudSync;
