import mongoose from 'mongoose';

const syncQueueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  operation: {
    type: {
      type: String,
      enum: ['create', 'update', 'delete', 'sync'],
      required: true
    },
    entity: {
      type: String,
      enum: ['device', 'program', 'battery', 'event'],
      required: true
    },
    data: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['pending', 'syncing', 'completed', 'failed'],
    default: 'pending'
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  retries: {
    type: Number,
    default: 0,
    max: 3
  },
  error: {
    type: String,
    default: null
  },
  lastAttempt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

syncQueueSchema.index({ userId: 1, status: 1, priority: -1 });
syncQueueSchema.index({ userId: 1, deviceId: 1, status: 1 });
syncQueueSchema.index({ createdAt: 1 });

export default mongoose.model('SyncQueue', syncQueueSchema);
