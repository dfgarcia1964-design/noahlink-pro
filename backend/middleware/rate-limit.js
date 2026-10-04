import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.isAdmin === true
});

const syncLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Sync requests limited',
  standardHeaders: true,
  legacyHeaders: false
});

const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many create requests',
  standardHeaders: true,
  legacyHeaders: false
});

export { authLimiter, apiLimiter, syncLimiter, createLimiter };
