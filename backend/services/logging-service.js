import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class LoggingService {
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    };

    const logLine = JSON.stringify(logEntry);
    console.log(`[${level}] ${message}`);

    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logLine + '\n');
  }

  info(message, data) {
    this.log('INFO', message, data);
  }

  warn(message, data) {
    this.log('WARN', message, data);
  }

  error(message, data) {
    this.log('ERROR', message, data);
  }

  debug(message, data) {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, data);
    }
  }

  logAuthEvent(userId, event, ip, userAgent) {
    this.log('AUTH', `User ${userId} - ${event}`, { userId, event, ip, userAgent });
  }

  logApiRequest(method, path, statusCode, duration) {
    this.log('API', `${method} ${path} - ${statusCode}`, { method, path, statusCode, duration: `${duration}ms` });
  }

  logDatabaseOperation(operation, collection, duration) {
    this.log('DB', `${operation} on ${collection}`, { operation, collection, duration: `${duration}ms` });
  }

  logSyncOperation(userId, deviceId, status, duration) {
    this.log('SYNC', `Sync for user ${userId} device ${deviceId} - ${status}`, { userId, deviceId, status, duration: `${duration}ms` });
  }
}

export default new LoggingService();
