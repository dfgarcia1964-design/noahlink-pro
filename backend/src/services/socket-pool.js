const logger = require('../utils/logger');

class SocketPool {
  constructor(options = {}) {
    this.maxConnections = options.maxConnections || 10;
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    this.connectionTimeout = options.connectionTimeout || 60000;

    this.connections = new Map();
    this.connectionStates = new Map();
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      reconnectAttempts: 0,
      failedConnections: 0
    };
  }

  addConnection(id, socket) {
    if (this.connections.size >= this.maxConnections) {
      logger.warn(`Connection pool limit reached (${this.maxConnections})`);
      return false;
    }

    this.connections.set(id, {
      socket,
      createdAt: Date.now(),
      lastHeartbeat: Date.now(),
      status: 'active',
      messageCount: 0
    });

    this.connectionStates.set(id, 'connected');
    this.stats.totalConnections++;
    this.stats.activeConnections++;

    this.setupHeartbeat(id);
    logger.info(`Connection added: ${id}`);
    return true;
  }

  removeConnection(id) {
    if (this.connections.has(id)) {
      const conn = this.connections.get(id);
      if (conn.heartbeatTimer) {
        clearInterval(conn.heartbeatTimer);
      }
      this.connections.delete(id);
      this.connectionStates.delete(id);
      this.stats.activeConnections--;
      logger.info(`Connection removed: ${id}`);
      return true;
    }
    return false;
  }

  setupHeartbeat(id) {
    const conn = this.connections.get(id);
    if (!conn) return;

    conn.heartbeatTimer = setInterval(() => {
      if (this.connections.has(id)) {
        const currentConn = this.connections.get(id);
        currentConn.lastHeartbeat = Date.now();

        if (currentConn.socket && typeof currentConn.socket.emit === 'function') {
          currentConn.socket.emit('heartbeat', { timestamp: Date.now() });
        }
      }
    }, this.heartbeatInterval);
  }

  handleReconnect(id) {
    const conn = this.connections.get(id);
    if (!conn) return;

    if (conn.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(`Max reconnect attempts reached for ${id}`);
      this.stats.failedConnections++;
      this.removeConnection(id);
      return;
    }

    conn.reconnectAttempts = (conn.reconnectAttempts || 0) + 1;
    this.stats.reconnectAttempts++;
    this.connectionStates.set(id, 'reconnecting');

    const backoffDelay = Math.min(
      1000 * Math.pow(2, conn.reconnectAttempts - 1),
      64000
    );
    const jitter = Math.random() * backoffDelay * 0.1;

    logger.info(`Reconnecting ${id} in ${backoffDelay + jitter}ms (attempt ${conn.reconnectAttempts})`);

    setTimeout(() => {
      this.connectionStates.set(id, 'connected');
      logger.info(`Reconnected: ${id}`);
    }, backoffDelay + jitter);
  }

  getConnection(id) {
    return this.connections.get(id);
  }

  getStats() {
    const connectionDetails = Array.from(this.connections.entries()).map(([id, conn]) => ({
      id,
      status: conn.status,
      messageCount: conn.messageCount,
      uptime: Date.now() - conn.createdAt,
      lastHeartbeat: Date.now() - conn.lastHeartbeat
    }));

    return {
      ...this.stats,
      connections: connectionDetails,
      poolHealth: {
        utilizationRate: (this.stats.activeConnections / this.maxConnections) * 100,
        avgUptime: connectionDetails.length > 0
          ? connectionDetails.reduce((sum, c) => sum + c.uptime, 0) / connectionDetails.length
          : 0
      }
    };
  }

  recordMessage(id) {
    const conn = this.connections.get(id);
    if (conn) {
      conn.messageCount++;
    }
  }

  getHealthStatus() {
    const now = Date.now();
    const healthStatus = {};

    for (const [id, conn] of this.connections) {
      const timeSinceHeartbeat = now - conn.lastHeartbeat;
      const isHealthy = timeSinceHeartbeat < this.heartbeatInterval * 2;

      healthStatus[id] = {
        status: isHealthy ? 'healthy' : 'degraded',
        timeSinceHeartbeat,
        uptime: now - conn.createdAt
      };
    }

    return healthStatus;
  }

  cleanup() {
    for (const [id, conn] of this.connections) {
      if (conn.heartbeatTimer) {
        clearInterval(conn.heartbeatTimer);
      }
    }
    this.connections.clear();
    this.connectionStates.clear();
    logger.info('Socket pool cleaned up');
  }
}

module.exports = SocketPool;
