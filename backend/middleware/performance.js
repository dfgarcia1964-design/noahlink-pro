import monitoringService from '../services/monitoring-service.js';

const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const duration = Date.now() - start;
    monitoringService.recordRequest(duration);

    res.set('X-Response-Time', `${duration}ms`);
    res.set('X-Processing-Time', `${duration}ms`);

    if (res.statusCode >= 400) {
      monitoringService.recordError();
    }

    return originalSend.call(this, data);
  };

  next();
};

const compressionMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    if (data && typeof data === 'object') {
      res.set('Content-Encoding', 'application/json');
    }
    return originalJson.call(this, data);
  };

  next();
};

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${duration}`);
    } else {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    next();
  };
};

export { performanceMiddleware, compressionMiddleware, cacheMiddleware };
