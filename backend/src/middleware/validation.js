// Request validation middleware
const logger = require('../utils/logger');

const validators = {
  // Validar ID de dispositivo
  deviceId: (value) => {
    if (!value || typeof value !== 'string' || value.length < 3) {
      return 'Invalid device ID';
    }
    return null;
  },

  // Validar volumen (0-100)
  volume: (value) => {
    const vol = parseInt(value);
    if (isNaN(vol) || vol < 0 || vol > 100) {
      return 'Volume must be between 0 and 100';
    }
    return null;
  },

  // Validar userId
  userId: (value) => {
    if (!value || typeof value !== 'string' || value.length < 1) {
      return 'Invalid user ID';
    }
    return null;
  },

  // Validar programa
  program: (obj) => {
    if (!obj || typeof obj !== 'object') {
      return 'Invalid program object';
    }
    if (!obj.name || typeof obj.name !== 'string') {
      return 'Program name is required';
    }
    if (!Array.isArray(obj.frequencies) || obj.frequencies.length === 0) {
      return 'Frequencies array is required and must not be empty';
    }
    return null;
  },

  // Validar perfil
  profile: (obj) => {
    if (!obj || typeof obj !== 'object') {
      return 'Invalid profile object';
    }
    if (!obj.name || typeof obj.name !== 'string') {
      return 'Profile name is required';
    }
    if (!obj.device || typeof obj.device !== 'string') {
      return 'Device is required';
    }
    return null;
  },

  // Validar alerta
  alert: (obj) => {
    if (!obj || typeof obj !== 'object') {
      return 'Invalid alert object';
    }
    if (!obj.type || typeof obj.type !== 'string') {
      return 'Alert type is required';
    }
    if (!obj.severity || typeof obj.severity !== 'string') {
      return 'Alert severity is required';
    }
    if (!obj.message || typeof obj.message !== 'string') {
      return 'Alert message is required';
    }
    return null;
  },

  // Validar email
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value || !emailRegex.test(value)) {
      return 'Invalid email format';
    }
    return null;
  }
};

// Middleware para validar request
const validateRequest = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validar body
    if (schema.body) {
      for (const [field, validator] of Object.entries(schema.body)) {
        const value = req.body[field];
        const error = validator(value);
        if (error) {
          errors.push({ field, error });
        }
      }
    }

    // Validar params
    if (schema.params) {
      for (const [field, validator] of Object.entries(schema.params)) {
        const value = req.params[field];
        const error = validator(value);
        if (error) {
          errors.push({ field, error });
        }
      }
    }

    // Validar query
    if (schema.query) {
      for (const [field, validator] of Object.entries(schema.query)) {
        const value = req.query[field];
        if (value !== undefined) {
          const error = validator(value);
          if (error) {
            errors.push({ field, error });
          }
        }
      }
    }

    if (errors.length > 0) {
      logger.warn('Validation failed', errors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

module.exports = {
  validators,
  validateRequest
};
