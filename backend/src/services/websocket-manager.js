const logger = require('../utils/logger');

/**
 * WebSocket Manager - Gestiona todas las conexiones y eventos en tiempo real
 */
class WebSocketManager {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> Set de socket ids
    this.deviceSubscriptions = new Map(); // deviceId -> Set de socket ids
    this.userDevices = new Map(); // userId -> Set de deviceIds
    this.batteryIntervals = new Map(); // deviceId -> interval id
  }

  /**
   * Inicializar el servidor WebSocket
   */
  initializeServer() {
    this.io.on('connection', (socket) => {
      logger.info(`WebSocket connected`, { socketId: socket.id });

      // Manejadores de conexión
      socket.on('join-device', (data) => this.handleJoinDevice(socket, data));
      socket.on('leave-device', (data) => this.handleLeaveDevice(socket, data));
      socket.on('request-battery-update', (data) => this.handleBatteryUpdate(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));

      // Enviar confirmación de conexión
      socket.emit('connected', {
        message: 'Conectado al servidor WebSocket',
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    logger.success('WebSocket server initialized');
  }

  /**
   * Usuario se suscribe a un dispositivo
   */
  handleJoinDevice(socket, data) {
    const { userId, deviceId } = data;

    if (!userId || !deviceId) {
      logger.warn('Invalid join-device data', { userId, deviceId });
      socket.emit('error', { message: 'userId and deviceId required' });
      return;
    }

    // Agregar socket a usuario
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId).add(socket.id);

    // Agregar socket a dispositivo
    if (!this.deviceSubscriptions.has(deviceId)) {
      this.deviceSubscriptions.set(deviceId, new Set());
    }
    this.deviceSubscriptions.get(deviceId).add(socket.id);

    // Agregar dispositivo a usuario
    if (!this.userDevices.has(userId)) {
      this.userDevices.set(userId, new Set());
    }
    this.userDevices.get(userId).add(deviceId);

    // Socket se une a una sala
    socket.join(`device:${deviceId}`);
    socket.join(`user:${userId}`);

    logger.info(`User joined device`, { userId, deviceId, socketId: socket.id });

    // Enviar confirmación
    socket.emit('joined-device', {
      deviceId,
      message: `Conectado al dispositivo ${deviceId}`,
      timestamp: new Date().toISOString()
    });

    // Notificar a otros usuarios que alguien se conectó
    this.io.to(`device:${deviceId}`).emit('user-joined-device', {
      userId,
      deviceId,
      userCount: this.deviceSubscriptions.get(deviceId).size,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Usuario se desuscribe de un dispositivo
   */
  handleLeaveDevice(socket, data) {
    const { userId, deviceId } = data;

    if (!userId || !deviceId) {
      return;
    }

    // Remover socket de dispositivo
    if (this.deviceSubscriptions.has(deviceId)) {
      this.deviceSubscriptions.get(deviceId).delete(socket.id);
      if (this.deviceSubscriptions.get(deviceId).size === 0) {
        this.deviceSubscriptions.delete(deviceId);
        // Detener emisión de batería si no hay más suscriptores
        if (this.batteryIntervals.has(deviceId)) {
          clearInterval(this.batteryIntervals.get(deviceId));
          this.batteryIntervals.delete(deviceId);
          logger.info(`Battery emission stopped for ${deviceId}`);
        }
      }
    }

    // Remover socket de usuario
    if (this.connectedUsers.has(userId)) {
      this.connectedUsers.get(userId).delete(socket.id);
    }

    // Remover socket de dispositivo del usuario
    if (this.userDevices.has(userId)) {
      this.userDevices.get(userId).delete(deviceId);
    }

    socket.leave(`device:${deviceId}`);

    logger.info(`User left device`, { userId, deviceId, socketId: socket.id });

    socket.emit('left-device', {
      deviceId,
      message: `Desconectado del dispositivo ${deviceId}`,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Manejar desconexión
   */
  handleDisconnect(socket) {
    // Limpiar referencias del usuario
    for (const [userId, sockets] of this.connectedUsers.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.connectedUsers.delete(userId);
        }
      }
    }

    // Limpiar referencias de dispositivos
    for (const [deviceId, sockets] of this.deviceSubscriptions.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.deviceSubscriptions.delete(deviceId);
          // Detener emisión de batería
          if (this.batteryIntervals.has(deviceId)) {
            clearInterval(this.batteryIntervals.get(deviceId));
            this.batteryIntervals.delete(deviceId);
          }
        }
      }
    }

    logger.info(`WebSocket disconnected`, { socketId: socket.id });
  }

  /**
   * Manejar solicitud de actualización de batería
   */
  handleBatteryUpdate(socket, data) {
    const { deviceId } = data;

    if (!deviceId) {
      socket.emit('error', { message: 'deviceId required' });
      return;
    }

    logger.info(`Battery update requested`, { deviceId });

    // Emitir actualización inmediata
    this.emitBatteryUpdate(deviceId);
  }

  /**
   * Emitir actualización de batería a un dispositivo
   */
  emitBatteryUpdate(deviceId, batteryData = null) {
    // Si no hay datos, generar datos simulados
    const data = batteryData || {
      level: Math.round(Math.random() * (95 - 50) + 50),
      voltage: (Math.random() * (1.5 - 1.3) + 1.3).toFixed(2),
      temperature: Math.round(Math.random() * (25 - 20) + 20),
      status: 'good',
      statusLabel: 'Bueno'
    };

    const payload = {
      deviceId,
      battery: data,
      timestamp: new Date().toISOString()
    };

    // Emitir a todos los usuarios suscritos al dispositivo
    this.io.to(`device:${deviceId}`).emit('battery:update', payload);

    logger.debug(`Battery update emitted for ${deviceId}`, { level: data.level });
  }

  /**
   * Emitir evento nuevo
   */
  emitEventLogged(deviceId, event) {
    const payload = {
      deviceId,
      event,
      timestamp: new Date().toISOString()
    };

    this.io.to(`device:${deviceId}`).emit('event:logged', payload);

    logger.debug(`Event emitted for ${deviceId}`, { type: event.type });
  }

  /**
   * Emitir cambio de estado del dispositivo
   */
  emitDeviceStatusChange(deviceId, status) {
    const payload = {
      deviceId,
      status,
      timestamp: new Date().toISOString()
    };

    this.io.to(`device:${deviceId}`).emit('device:status-changed', payload);

    logger.info(`Device status changed`, { deviceId, status });
  }

  /**
   * Emitir cambio de programa
   */
  emitProgramChanged(deviceId, oldProgram, newProgram) {
    const payload = {
      deviceId,
      oldProgram,
      newProgram,
      timestamp: new Date().toISOString()
    };

    this.io.to(`device:${deviceId}`).emit('program:changed', payload);

    logger.info(`Program changed`, { deviceId, oldProgram, newProgram });
  }

  /**
   * Emitir cambio de volumen
   */
  emitVolumeChanged(deviceId, oldVolume, newVolume) {
    const payload = {
      deviceId,
      oldVolume,
      newVolume,
      timestamp: new Date().toISOString()
    };

    this.io.to(`device:${deviceId}`).emit('volume:changed', payload);

    logger.debug(`Volume changed`, { deviceId, oldVolume, newVolume });
  }

  /**
   * Iniciar emisión automática de actualizaciones de batería
   */
  startBatteryEmission(deviceId, interval = 30000) {
    if (this.batteryIntervals.has(deviceId)) {
      logger.warn(`Battery emission already running for ${deviceId}`);
      return;
    }

    const intervalId = setInterval(() => {
      if (this.deviceSubscriptions.has(deviceId)) {
        this.emitBatteryUpdate(deviceId);
      } else {
        // Si no hay suscriptores, detener
        clearInterval(intervalId);
        this.batteryIntervals.delete(deviceId);
      }
    }, interval);

    this.batteryIntervals.set(deviceId, intervalId);

    logger.info(`Battery emission started for ${deviceId}`, {
      interval: `${interval}ms`
    });
  }

  /**
   * Detener emisión automática de batería
   */
  stopBatteryEmission(deviceId) {
    if (this.batteryIntervals.has(deviceId)) {
      clearInterval(this.batteryIntervals.get(deviceId));
      this.batteryIntervals.delete(deviceId);
      logger.info(`Battery emission stopped for ${deviceId}`);
    }
  }

  /**
   * Obtener estadísticas de conexión
   */
  getStats() {
    return {
      totalConnections: this.io.engine.clientsCount,
      totalUsers: this.connectedUsers.size,
      totalDevices: this.deviceSubscriptions.size,
      activeDevices: this.batteryIntervals.size
    };
  }

  /**
   * Obtener usuarios conectados a un dispositivo
   */
  getDeviceUsers(deviceId) {
    return this.deviceSubscriptions.get(deviceId)?.size || 0;
  }

  /**
   * Obtener dispositivos de un usuario
   */
  getUserDevices(userId) {
    return Array.from(this.userDevices.get(userId) || []);
  }

  /**
   * Enviar notificación a un usuario
   */
  notifyUser(userId, notification) {
    const payload = {
      message: notification.message,
      type: notification.type || 'info',
      data: notification.data,
      timestamp: new Date().toISOString()
    };

    this.io.to(`user:${userId}`).emit('notification', payload);

    logger.info(`Notification sent to user ${userId}`, { type: payload.type });
  }

  /**
   * Broadcast a todos los dispositivos
   */
  broadcastToAllDevices(event, data) {
    this.io.emit(event, {
      data,
      timestamp: new Date().toISOString()
    });

    logger.info(`Broadcast sent`, { event, recipientCount: this.io.engine.clientsCount });
  }
}

module.exports = WebSocketManager;
