const mongoose = require('mongoose');

// ==================== PROGRAM SCHEMA ====================

const programSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'user-001'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  frequencies: {
    type: Map,
    of: Number,
    required: true,
    default: {}
  },
  description: {
    type: String,
    default: ''
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

// ==================== PROFILE SCHEMA ====================

const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'user-001'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  device: {
    type: String,
    required: true
  },
  programs: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: false
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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

// ==================== SETTINGS SCHEMA ====================

const settingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: 'user-001'
  },
  autoConnect: {
    type: Boolean,
    default: true
  },
  updateFrequency: {
    type: Number,
    default: 30
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  soundAlerts: {
    type: Boolean,
    default: true
  },
  vibration: {
    type: Boolean,
    default: true
  },
  batteryThreshold: {
    type: Number,
    default: 20
  },
  autoBackup: {
    type: Boolean,
    default: true
  },
  dataCollection: {
    type: Boolean,
    default: false
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    enum: ['es', 'en', 'de', 'fr'],
    default: 'es'
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

// ==================== ALERT SCHEMA ====================

const alertSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'user-001'
  },
  type: {
    type: String,
    enum: ['battery', 'system', 'connection', 'program', 'maintenance'],
    required: true
  },
  severity: {
    type: String,
    enum: ['error', 'warning', 'info', 'success'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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

// ==================== BATTERY HISTORY SCHEMA ====================

const batteryHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'user-001'
  },
  deviceId: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  voltage: {
    type: Number,
    default: 0
  },
  temperature: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create indexes for better query performance
batteryHistorySchema.index({ userId: 1, timestamp: -1 });
alertSchema.index({ userId: 1, createdAt: -1 });
programSchema.index({ userId: 1, createdAt: -1 });
profileSchema.index({ userId: 1, createdAt: -1 });

// ==================== MODELS ====================

const Program = mongoose.model('Program', programSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const Alert = mongoose.model('Alert', alertSchema);
const BatteryHistory = mongoose.model('BatteryHistory', batteryHistorySchema);

module.exports = {
  Program,
  Profile,
  Settings,
  Alert,
  BatteryHistory,
  programSchema,
  profileSchema,
  settingsSchema,
  alertSchema,
  batteryHistorySchema
};
