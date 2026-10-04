import { useCallback, useRef, useState, useEffect } from 'react';

const useOptimizedApi = (apiFunction, delay = 500) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const cacheRef = useRef({});

  const execute = useCallback(async (...args) => {
    const cacheKey = JSON.stringify(args);

    if (cacheRef.current[cacheKey]) {
      setData(cacheRef.current[cacheKey]);
      return cacheRef.current[cacheKey];
    }

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        cacheRef.current[cacheKey] = result;
        setData(result);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, delay);
  }, [apiFunction, delay]);

  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return { data, loading, error, execute, clearCache };
};

export default useOptimizedApi;
