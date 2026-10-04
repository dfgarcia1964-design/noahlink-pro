class ValidationService {
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password) {
    if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
    if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain lowercase letters' };
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain uppercase letters' };
    if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain numbers' };
    return { valid: true };
  }

  validateDevice(deviceData) {
    const errors = {};
    if (!deviceData.deviceId) errors.deviceId = 'deviceId is required';
    if (!deviceData.deviceName) errors.deviceName = 'deviceName is required';
    if (!deviceData.model) errors.model = 'model is required';
    return Object.keys(errors).length === 0 ? { valid: true } : { valid: false, errors };
  }

  validateAudioProgram(programData) {
    const errors = {};
    if (!programData.name) errors.name = 'name is required';
    if (!programData.settings) errors.settings = 'settings are required';

    const settings = programData.settings;
    const audioFields = ['lowFreq', 'midFreq', 'highFreq', 'compression', 'noiseReduction'];
    for (const field of audioFields) {
      if (settings[field] !== undefined) {
        if (settings[field] < 0 || settings[field] > 100) {
          errors[field] = `${field} must be between 0 and 100`;
        }
      }
    }

    return Object.keys(errors).length === 0 ? { valid: true } : { valid: false, errors };
  }

  validateEvent(eventData) {
    const errors = {};
    if (!eventData.type) errors.type = 'type is required';
    if (!['battery', 'connection', 'program', 'volume', 'sync', 'error', 'info'].includes(eventData.type)) {
      errors.type = 'Invalid event type';
    }
    if (!eventData.title) errors.title = 'title is required';
    if (!eventData.message) errors.message = 'message is required';
    return Object.keys(errors).length === 0 ? { valid: true } : { valid: false, errors };
  }

  validateBatteryReading(batteryData) {
    const errors = {};
    if (batteryData.level === undefined) errors.level = 'level is required';
    if (batteryData.level < 0 || batteryData.level > 100) {
      errors.level = 'level must be between 0 and 100';
    }
    if (batteryData.drainRate !== undefined && batteryData.drainRate < 0) {
      errors.drainRate = 'drainRate cannot be negative';
    }
    return Object.keys(errors).length === 0 ? { valid: true } : { valid: false, errors };
  }

  sanitizeInput(input) {
    if (typeof input === 'string') {
      return input.trim().substring(0, 1000);
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      for (const key in input) {
        if (key.length <= 100) {
          sanitized[key] = this.sanitizeInput(input[key]);
        }
      }
      return sanitized;
    }
    return input;
  }
}

export default new ValidationService();
