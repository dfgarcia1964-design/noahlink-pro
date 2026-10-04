import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['battery', 'connection', 'program', 'volume', 'sync', 'error', 'info'],
    index: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expire: 7776000
  }
});

eventSchema.index({ userId: 1, deviceId: 1, timestamp: -1 });
eventSchema.index({ userId: 1, type: 1, timestamp: -1 });
eventSchema.index({ userId: 1, severity: 1, read: 1 });

export default mongoose.model('Event', eventSchema);
