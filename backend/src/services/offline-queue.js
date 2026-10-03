const logger = require('../utils/logger');

class OfflineQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
  }

  enqueue(operation) {
    const queued = {
      id: `op-${Date.now()}`,
      operation,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    };

    this.queue.push(queued);
    logger.info(`Enqueued operation: ${queued.id}`);
    return queued.id;
  }

  dequeue() {
    if (this.queue.length === 0) return null;
    return this.queue.shift();
  }

  async processQueue(handler) {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.dequeue();
        if (!item) break;

        try {
          await handler(item.operation);
          item.status = 'completed';
          logger.info(`Processed operation: ${item.id}`);
        } catch (error) {
          item.retries++;

          if (item.retries < this.maxRetries) {
            item.status = 'retrying';
            this.queue.push(item);
            logger.warn(`Retrying operation ${item.id} (attempt ${item.retries})`);
          } else {
            item.status = 'failed';
            logger.error(`Failed to process operation ${item.id}`);
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      operations: this.queue.map(op => ({
        id: op.id,
        status: op.status,
        retries: op.retries,
        age: Date.now() - op.timestamp
      }))
    };
  }

  clear() {
    const count = this.queue.length;
    this.queue = [];
    logger.info(`Cleared ${count} operations from queue`);
    return count;
  }

  getPriority(operation) {
    if (operation.type === 'battery') return 1;
    if (operation.type === 'event') return 2;
    return 3;
  }

  sortByPriority() {
    this.queue.sort((a, b) => this.getPriority(a.operation) - this.getPriority(b.operation));
  }
}

module.exports = new OfflineQueue();
