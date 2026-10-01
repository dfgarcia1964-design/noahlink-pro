const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ==================== USER SCHEMA ====================

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // No incluir en queries por defecto
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para generar token JWT
userSchema.methods.generateToken = function(jwtSecret, expiresIn = '7d') {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this._id, email: this.email },
    jwtSecret,
    { expiresIn }
  );
};

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

const User = mongoose.model('User', userSchema);
const Program = mongoose.model('Program', programSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const Alert = mongoose.model('Alert', alertSchema);
const BatteryHistory = mongoose.model('BatteryHistory', batteryHistorySchema);

module.exports = {
  User,
  Program,
  Profile,
  Settings,
  Alert,
  BatteryHistory,
  userSchema,
  programSchema,
  profileSchema,
  settingsSchema,
  alertSchema,
  batteryHistorySchema
};
