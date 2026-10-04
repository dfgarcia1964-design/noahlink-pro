import mongoose from 'mongoose';

const audioProgramSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  isPreset: {
    type: Boolean,
    default: false
  },
  settings: {
    lowFreq: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    midFreq: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    highFreq: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    compression: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    noiseReduction: {
      type: Number,
      min: 0,
      max: 100,
      default: 30
    },
    windNoise: {
      type: Number,
      min: 0,
      max: 100,
      default: 30
    },
    feedback: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  category: {
    type: String,
    enum: ['conversation', 'outdoor', 'quiet', 'music', 'phone', 'custom'],
    default: 'custom'
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
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

audioProgramSchema.index({ userId: 1, deviceId: 1 });
audioProgramSchema.index({ userId: 1, isPreset: 1 });

export default mongoose.model('AudioProgram', audioProgramSchema);
