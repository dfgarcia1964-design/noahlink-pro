// Middleware para estandarizar respuestas API
const logger = require('../utils/logger');

class ApiResponse {
  constructor(success = true, data = null, message = null, error = null, statusCode = 200) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
    this.timestamp = new Date().toISOString();
    this.statusCode = statusCode;
  }

  toJSON() {
    const response = {
      success: this.success,
      timestamp: this.timestamp
    };

    if (this.message) {
      response.message = this.message;
    }

    if (this.data) {
      response.data = this.data;
    }

    if (this.error) {
      response.error = this.error;
    }

    return response;
  }
}

// Extender métodos de respuesta
const responseFormatter = (req, res, next) => {
  // Método para enviar respuesta exitosa
  res.success = (data, message = null, statusCode = 200) => {
    const response = new ApiResponse(true, data, message, null, statusCode);
    logger.info(`${req.method} ${req.path}`, { status: statusCode, message });
    return res.status(statusCode).json(response.toJSON());
  };

  // Método para enviar respuesta de error
  res.error = (error, statusCode = 500, message = null) => {
    const errorMessage = message || error.message || 'Internal Server Error';
    const response = new ApiResponse(false, null, null, errorMessage, statusCode);
    logger.error(`${req.method} ${req.path}`, { status: statusCode, error: errorMessage });
    return res.status(statusCode).json(response.toJSON());
  };

  // Método para validación fallida
  res.badRequest = (error) => {
    const response = new ApiResponse(false, null, null, error, 400);
    logger.warn(`${req.method} ${req.path}`, { status: 400, error });
    return res.status(400).json(response.toJSON());
  };

  // Método para no encontrado
  res.notFound = (resource) => {
    const error = `${resource} not found`;
    const response = new ApiResponse(false, null, null, error, 404);
    logger.warn(`${req.method} ${req.path}`, { status: 404, error });
    return res.status(404).json(response.toJSON());
  };

  // Método para no autorizado
  res.unauthorized = (error = 'Unauthorized') => {
    const response = new ApiResponse(false, null, null, error, 401);
    logger.warn(`${req.method} ${req.path}`, { status: 401, error });
    return res.status(401).json(response.toJSON());
  };

  // Método para prohibido
  res.forbidden = (error = 'Forbidden') => {
    const response = new ApiResponse(false, null, null, error, 403);
    logger.warn(`${req.method} ${req.path}`, { status: 403, error });
    return res.status(403).json(response.toJSON());
  };

  next();
};

module.exports = {
  ApiResponse,
  responseFormatter
};
