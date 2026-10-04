import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  deviceName: {
    type: String,
    required: true,
    trim: true
  },
  manufacturer: {
    type: String,
    default: 'Phonak'
  },
  model: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  connected: {
    type: Boolean,
    default: false
  },
  lastSync: {
    type: Date,
    default: null
  },
  lastConnection: {
    type: Date,
    default: null
  },
  programs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AudioProgram'
  }],
  currentProgram: {
    type: String,
    default: 'default'
  },
  volume: {
    type: Number,
    min: 0,
    max: 100,
    default: 75
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  metadata: {
    firmwareVersion: String,
    hardwareVersion: String,
    bluetoothAddress: String
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

deviceSchema.index({ userId: 1, deviceId: 1 });
deviceSchema.index({ userId: 1, connected: 1 });
deviceSchema.index({ lastSync: -1 });

export default mongoose.model('Device', deviceSchema);
