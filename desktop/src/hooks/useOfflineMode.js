import { useEffect, useState, useCallback } from 'react';

const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const enqueue = useCallback((operation) => {
    setQueue(prev => [...prev, {
      id: `op-${Date.now()}`,
      operation,
      timestamp: Date.now()
    }]);
  }, []);

  const dequeue = useCallback((id) => {
    setQueue(prev => prev.filter(op => op.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    isOnline,
    queue,
    queueLength: queue.length,
    enqueue,
    dequeue,
    clearQueue
  };
};

export default useOfflineMode;
