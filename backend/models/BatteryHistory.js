import mongoose from 'mongoose';

const batteryHistorySchema = new mongoose.Schema({
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
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  drainRate: {
    type: Number,
    default: 0
  },
  isCharging: {
    type: Boolean,
    default: false
  },
  temperature: {
    type: Number,
    default: null
  },
  estimatedHoursRemaining: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expire: 2592000
  }
});

batteryHistorySchema.index({ userId: 1, deviceId: 1, timestamp: -1 });
batteryHistorySchema.index({ timestamp: -1 });

export default mongoose.model('BatteryHistory', batteryHistorySchema);
