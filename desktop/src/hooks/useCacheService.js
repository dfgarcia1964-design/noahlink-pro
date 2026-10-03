import { useCallback, useState, useEffect } from 'react';
import cacheManager from '../utils/cache-manager';

const useCacheService = () => {
  const [cacheStats, setCacheStats] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(cacheManager.getStats());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const set = useCallback((key, value, ttl = 300000) => {
    cacheManager.set(key, value, ttl);
  }, []);

  const get = useCallback((key) => {
    return cacheManager.get(key);
  }, []);

  const delete_ = useCallback((key) => {
    cacheManager.delete(key);
  }, []);

  const clear = useCallback(() => {
    cacheManager.clear();
  }, []);

  const has = useCallback((key) => {
    return cacheManager.get(key) !== null;
  }, []);

  return {
    set,
    get,
    delete: delete_,
    clear,
    has,
    stats: cacheStats,
    cacheSize: cacheStats?.size || 0
  };
};

export default useCacheService;
