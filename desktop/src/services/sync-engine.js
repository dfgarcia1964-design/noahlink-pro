class SyncEngine {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.syncListeners = [];
  }

  addToSyncQueue(operation) {
    this.syncQueue.push({
      id: `sync-${Date.now()}`,
      operation,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    });
    this.notifyListeners('queued', operation);
    return this.syncQueue[this.syncQueue.length - 1].id;
  }

  async processSyncQueue(handler) {
    if (this.isSyncing || this.syncQueue.length === 0) return;

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      const failed = [];

      for (let i = 0; i < this.syncQueue.length; i++) {
        const item = this.syncQueue[i];

        try {
          this.notifyListeners('syncing', item.operation);
          await handler(item.operation);
          item.status = 'completed';
          this.notifyListeners('synced', item.operation);
        } catch (error) {
          item.retries++;

          if (item.retries < 3) {
            item.status = 'pending';
            this.notifyListeners('retry', item.operation);
          } else {
            item.status = 'failed';
            failed.push(item);
            this.notifyListeners('failed', item.operation);
          }
        }
      }

      // Remove completed items
      this.syncQueue = this.syncQueue.filter(item => item.status !== 'completed');

      this.lastSyncTime = Date.now();
      this.notifyListeners('complete', { duration: Date.now() - startTime, failed });
    } finally {
      this.isSyncing = false;
    }
  }

  onSyncProgress(listener) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  notifyListeners(event, data) {
    this.syncListeners.forEach(listener => {
      try {
        listener({ event, data, timestamp: Date.now() });
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  getStatus() {
    return {
      isSyncing: this.isSyncing,
      queueLength: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime,
      queue: this.syncQueue.map(item => ({
        id: item.id,
        status: item.status,
        retries: item.retries,
        age: Date.now() - item.timestamp
      }))
    };
  }

  clearQueue() {
    const count = this.syncQueue.length;
    this.syncQueue = [];
    return count;
  }

  clearFailed() {
    const failed = this.syncQueue.filter(item => item.status === 'failed');
    this.syncQueue = this.syncQueue.filter(item => item.status !== 'failed');
    return failed.length;
  }
}

export default new SyncEngine();
