const express = require('express');
const router = express.Router();
const {
  Program,
  Profile,
  Settings,
  Alert,
  BatteryHistory
} = require('../models');

const userId = 'user-001'; // TODO: Get from auth middleware

// ==================== PROGRAMS ====================

// GET all programs
router.get('/programs', async (req, res) => {
  try {
    const programs = await Program.find({ userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: programs.length,
      programs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single program
router.get('/programs/:programId', async (req, res) => {
  try {
    const program = await Program.findById(req.params.programId);
    if (!program || program.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }
    res.json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE program
router.post('/programs', async (req, res) => {
  try {
    const { name, frequencies, description } = req.body;

    if (!name || !frequencies) {
      return res.status(400).json({ success: false, error: 'Name and frequencies required' });
    }

    const newProgram = new Program({
      userId,
      name,
      frequencies,
      description: description || ''
    });

    await newProgram.save();

    res.status(201).json({
      success: true,
      message: 'Program created',
      program: newProgram
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE program
router.put('/programs/:programId', async (req, res) => {
  try {
    const program = await Program.findById(req.params.programId);

    if (!program || program.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }

    const { name, frequencies, description } = req.body;

    if (name) program.name = name;
    if (frequencies) program.frequencies = frequencies;
    if (description !== undefined) program.description = description;
    program.updatedAt = Date.now();

    await program.save();

    res.json({
      success: true,
      message: 'Program updated',
      program
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE program
router.delete('/programs/:programId', async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.programId);

    if (!program || program.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }

    res.json({
      success: true,
      message: 'Program deleted',
      program
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ANALYTICS ====================

// GET battery trends
router.get('/analytics/trends', async (req, res) => {
  try {
    const timeRange = req.query.range || '24h';
    let hoursBack = 24;

    if (timeRange === '7d') hoursBack = 7 * 24;
    if (timeRange === '30d') hoursBack = 30 * 24;
    if (timeRange === '90d') hoursBack = 90 * 24;

    const startDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const history = await BatteryHistory.find({
      userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    if (history.length === 0) {
      return res.json({
        success: true,
        analytics: {
          current: 85,
          average: 85,
          min: 85,
          max: 85,
          timeRange,
          history: [],
          prediction: {
            estimatedTime: 'N/A',
            estimatedDepletion: new Date(),
            trend: 'stable'
          }
        }
      });
    }

    const levels = history.map(h => h.level);
    const current = history[history.length - 1].level;
    const average = Math.round(levels.reduce((a, b) => a + b) / levels.length);
    const min = Math.min(...levels);
    const max = Math.max(...levels);

    const prediction = {
      estimatedTime: `~${Math.round((current / 3) + 2)} horas`,
      estimatedDepletion: new Date(Date.now() + (current / 3) * 60 * 60 * 1000).toISOString(),
      trend: current > average ? 'improving' : 'declining'
    };

    res.json({
      success: true,
      analytics: {
        current,
        average,
        min,
        max,
        timeRange,
        history,
        prediction
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET battery distribution
router.get('/analytics/distribution', async (req, res) => {
  try {
    const history = await BatteryHistory.find({ userId });

    if (history.length === 0) {
      return res.json({
        success: true,
        distribution: {
          excellent: { count: 0, percentage: 0 },
          good: { count: 0, percentage: 0 },
          low: { count: 0, percentage: 0 }
        }
      });
    }

    const excellent = history.filter(h => h.level > 80).length;
    const good = history.filter(h => h.level >= 50 && h.level <= 80).length;
    const low = history.filter(h => h.level < 50).length;
    const total = history.length;

    res.json({
      success: true,
      distribution: {
        excellent: { count: excellent, percentage: Math.round((excellent / total) * 100) },
        good: { count: good, percentage: Math.round((good / total) * 100) },
        low: { count: low, percentage: Math.round((low / total) * 100) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET insights
router.get('/analytics/insights', async (req, res) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const history = await BatteryHistory.find({
      userId,
      timestamp: { $gte: last24h }
    }).sort({ timestamp: 1 });

    if (history.length < 2) {
      return res.json({
        success: true,
        insights: {
          averageUsagePerHour: '0%',
          batteryTrend: 'insufficient data',
          recommendations: ['Usar el dispositivo para generar datos'],
          lastUpdated: new Date().toISOString()
        }
      });
    }

    const avgUsage = ((history[0].level - history[history.length - 1].level) / history.length).toFixed(1);

    res.json({
      success: true,
      insights: {
        averageUsagePerHour: `${avgUsage}%`,
        batteryTrend: history[history.length - 1].level > history[0].level ? 'improving' : 'declining',
        recommendations: [
          `Uso promedio: ${avgUsage}% por hora`,
          `Batería actual: ${history[history.length - 1].level}%`,
          'Se recomienda cargar antes de las 20:00',
          'Usar modo eco para mayor duración'
        ],
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PROFILES ====================

// GET all profiles
router.get('/profiles', async (req, res) => {
  try {
    const profiles = await Profile.find({ userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: profiles.length,
      profiles
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single profile
router.get('/profiles/:profileId', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile || profile.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE profile
router.post('/profiles', async (req, res) => {
  try {
    const { name, device, programs } = req.body;

    if (!name || !device) {
      return res.status(400).json({ success: false, error: 'Name and device required' });
    }

    const newProfile = new Profile({
      userId,
      name,
      device,
      programs: programs || 0,
      active: false
    });

    await newProfile.save();

    res.status(201).json({
      success: true,
      message: 'Profile created',
      profile: newProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE profile
router.put('/profiles/:profileId', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId);

    if (!profile || profile.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const { name, device, programs, active } = req.body;

    if (name) profile.name = name;
    if (device) profile.device = device;
    if (typeof programs === 'number') profile.programs = programs;

    if (typeof active === 'boolean') {
      if (active) {
        await Profile.updateMany({ userId }, { active: false });
      }
      profile.active = active;
    }

    profile.updatedAt = Date.now();
    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated',
      profile
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE profile
router.delete('/profiles/:profileId', async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.profileId);

    if (!profile || profile.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    res.json({
      success: true,
      message: 'Profile deleted',
      profile
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SETTINGS ====================

// GET settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId });

    if (!settings) {
      settings = new Settings({ userId });
      await settings.save();
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE settings
router.put('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId });

    if (!settings) {
      settings = new Settings({ userId });
    }

    Object.assign(settings, req.body);
    settings.updatedAt = Date.now();
    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated',
      settings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// RESET settings
router.post('/settings/reset', async (req, res) => {
  try {
    const defaults = {
      autoConnect: true,
      updateFrequency: 30,
      notificationsEnabled: true,
      soundAlerts: true,
      vibration: true,
      batteryThreshold: 20,
      autoBackup: true,
      dataCollection: false,
      darkMode: false,
      language: 'es'
    };

    let settings = await Settings.findOne({ userId });

    if (!settings) {
      settings = new Settings({ userId, ...defaults });
    } else {
      Object.assign(settings, defaults);
    }

    settings.updatedAt = Date.now();
    await settings.save();

    res.json({
      success: true,
      message: 'Settings reset to defaults',
      settings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ALERTS ====================

// GET alerts
router.get('/alerts', async (req, res) => {
  try {
    const { type, read } = req.query;
    let query = { userId };

    if (type) query.type = type;
    if (read !== undefined) query.read = read === 'true';

    const alerts = await Alert.find(query).sort({ createdAt: -1 });
    const unread = alerts.filter(a => !a.read).length;

    res.json({
      success: true,
      count: alerts.length,
      unread,
      alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single alert
router.get('/alerts/:alertId', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.alertId);
    if (!alert || alert.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE alert
router.post('/alerts', async (req, res) => {
  try {
    const { type, severity, title, message } = req.body;

    if (!type || !severity || !title || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const newAlert = new Alert({
      userId,
      type,
      severity,
      title,
      message
    });

    await newAlert.save();

    res.status(201).json({
      success: true,
      message: 'Alert created',
      alert: newAlert
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE alert
router.put('/alerts/:alertId', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.alertId);

    if (!alert || alert.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    if (typeof req.body.read === 'boolean') {
      alert.read = req.body.read;
    }

    alert.updatedAt = Date.now();
    await alert.save();

    res.json({
      success: true,
      message: 'Alert updated',
      alert
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE alert
router.delete('/alerts/:alertId', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.alertId);

    if (!alert || alert.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    res.json({
      success: true,
      message: 'Alert deleted',
      alert
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// MARK ALL as read
router.post('/alerts/mark-all/read', async (req, res) => {
  try {
    await Alert.updateMany({ userId }, { read: true });

    res.json({
      success: true,
      message: 'All alerts marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE ALL alerts
router.delete('/alerts', async (req, res) => {
  try {
    const result = await Alert.deleteMany({ userId });

    res.json({
      success: true,
      message: `${result.deletedCount} alerts deleted`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
