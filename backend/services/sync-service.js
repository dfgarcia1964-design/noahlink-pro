import { SyncQueue, Device, BatteryHistory, AudioProgram, Event } from '../models/index.js';

class SyncService {
  async addToSyncQueue(userId, deviceId, operation, priority = 5) {
    try {
      const item = new SyncQueue({
        userId,
        deviceId,
        operation,
        priority,
        status: 'pending'
      });
      await item.save();
      return item;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  async processSyncQueue(userId) {
    try {
      const pendingItems = await SyncQueue.find({
        userId,
        status: 'pending'
      }).sort({ priority: -1, createdAt: 1 });

      for (const item of pendingItems) {
        try {
          item.status = 'syncing';
          await item.save();

          await this.executeSyncOperation(item);

          item.status = 'completed';
          item.lastAttempt = new Date();
          await item.save();
        } catch (error) {
          item.retries++;
          if (item.retries >= 3) {
            item.status = 'failed';
            item.error = error.message;
          } else {
            item.status = 'pending';
          }
          item.lastAttempt = new Date();
          await item.save();
        }
      }

      return { processed: pendingItems.length };
    } catch (error) {
      console.error('Error processing sync queue:', error);
      throw error;
    }
  }

  async executeSyncOperation(queueItem) {
    const { operation, deviceId } = queueItem;
    const { type, entity, data } = operation;

    switch (entity) {
      case 'device':
        if (type === 'update') {
          await Device.findByIdAndUpdate(deviceId, data);
        }
        break;
      case 'program':
        if (type === 'create') {
          const newProgram = new AudioProgram(data);
          await newProgram.save();
        } else if (type === 'update') {
          await AudioProgram.findByIdAndUpdate(data._id, data);
        }
        break;
      case 'battery':
        if (type === 'create') {
          const newHistory = new BatteryHistory(data);
          await newHistory.save();
        }
        break;
      case 'event':
        if (type === 'create') {
          const newEvent = new Event(data);
          await newEvent.save();
        }
        break;
      default:
        throw new Error(`Unknown entity type: ${entity}`);
    }
  }

  async getSyncStatus(userId) {
    try {
      const pending = await SyncQueue.countDocuments({ userId, status: 'pending' });
      const syncing = await SyncQueue.countDocuments({ userId, status: 'syncing' });
      const failed = await SyncQueue.countDocuments({ userId, status: 'failed' });
      const completed = await SyncQueue.countDocuments({ userId, status: 'completed' });

      return { pending, syncing, failed, completed };
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }

  async clearFailedItems(userId) {
    try {
      const result = await SyncQueue.deleteMany({ userId, status: 'failed' });
      return result.deletedCount;
    } catch (error) {
      console.error('Error clearing failed items:', error);
      throw error;
    }
  }

  async resyncDevice(userId, deviceId) {
    try {
      const device = await Device.findOne({ _id: deviceId, userId });
      if (!device) throw new Error('Device not found');

      const item = new SyncQueue({
        userId,
        deviceId,
        operation: {
          type: 'sync',
          entity: 'device',
          data: { _id: deviceId }
        },
        priority: 8,
        status: 'pending'
      });

      await item.save();
      return item;
    } catch (error) {
      console.error('Error resyncing device:', error);
      throw error;
    }
  }
}

export default new SyncService();
