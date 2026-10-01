const express = require('express');
const router = express.Router();

// ==================== MOCK DATA ====================

// Programs Database (simulated)
let customPrograms = [
  {
    id: 'prog-001',
    name: 'Reunión',
    frequencies: { 100: 3, 500: 5, 1000: 7, 2000: 9, 4000: 12, 8000: 10 },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prog-002',
    name: 'Concierto',
    frequencies: { 100: 8, 500: 12, 1000: 15, 2000: 18, 4000: 20, 8000: 22 },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// User Profiles Database (simulated)
let userProfiles = [
  {
    id: 'profile-001',
    name: 'Perfil Principal',
    device: 'Naída UP 90',
    programs: 5,
    active: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'profile-002',
    name: 'Oficina',
    device: 'Naída UP 90',
    programs: 3,
    active: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// User Settings Database (simulated)
let userSettings = {
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

// Alerts Database (simulated)
let alerts = [
  {
    id: 'alert-001',
    type: 'battery',
    severity: 'warning',
    title: 'Batería Baja',
    message: 'Nivel de batería en 18%. Se recomienda cargar pronto.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: 'alert-002',
    type: 'system',
    severity: 'info',
    title: 'Actualización Disponible',
    message: 'Nueva versión 1.2.5 disponible para descargar.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: 'alert-003',
    type: 'connection',
    severity: 'error',
    title: 'Conexión Perdida',
    message: 'Conexión con el dispositivo interrumpida. Reintentando...',
    timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    read: true
  }
];

// Battery Analytics Database (simulated)
let batteryHistory = [];

// Generate mock battery history
function generateBatteryHistory() {
  const history = [];
  const now = Date.now();
  const oneHourMs = 60 * 60 * 1000;

  for (let i = 24; i >= 0; i--) {
    history.push({
      timestamp: new Date(now - i * oneHourMs).toISOString(),
      level: Math.max(0, Math.min(100, 85 - (24 - i) * 3 + Math.random() * 10))
    });
  }

  return history;
}

batteryHistory = generateBatteryHistory();

// ==================== ROUTES ====================

// ============ PROGRAMS ============

// GET all custom programs
router.get('/programs', (req, res) => {
  res.json({
    success: true,
    count: customPrograms.length,
    programs: customPrograms
  });
});

// GET single program
router.get('/programs/:programId', (req, res) => {
  const program = customPrograms.find(p => p.id === req.params.programId);
  if (!program) {
    return res.status(404).json({ success: false, error: 'Program not found' });
  }
  res.json({ success: true, program });
});

// CREATE new program
router.post('/programs', (req, res) => {
  const { name, frequencies } = req.body;

  if (!name || !frequencies) {
    return res.status(400).json({ success: false, error: 'Name and frequencies required' });
  }

  const newProgram = {
    id: `prog-${Date.now()}`,
    name,
    frequencies,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  customPrograms.push(newProgram);

  res.status(201).json({
    success: true,
    message: 'Program created',
    program: newProgram
  });
});

// UPDATE program
router.put('/programs/:programId', (req, res) => {
  const { name, frequencies } = req.body;
  const program = customPrograms.find(p => p.id === req.params.programId);

  if (!program) {
    return res.status(404).json({ success: false, error: 'Program not found' });
  }

  if (name) program.name = name;
  if (frequencies) program.frequencies = frequencies;
  program.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Program updated',
    program
  });
});

// DELETE program
router.delete('/programs/:programId', (req, res) => {
  const index = customPrograms.findIndex(p => p.id === req.params.programId);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Program not found' });
  }

  const deleted = customPrograms.splice(index, 1);

  res.json({
    success: true,
    message: 'Program deleted',
    program: deleted[0]
  });
});

// ============ ANALYTICS ============

// GET battery trends
router.get('/analytics/trends', (req, res) => {
  const timeRange = req.query.range || '24h';

  const analytics = {
    current: batteryHistory[batteryHistory.length - 1]?.level || 85,
    average: Math.round(batteryHistory.reduce((a, h) => a + h.level, 0) / batteryHistory.length),
    min: Math.min(...batteryHistory.map(h => h.level)),
    max: Math.max(...batteryHistory.map(h => h.level)),
    timeRange,
    history: batteryHistory,
    prediction: {
      estimatedTime: '~8 horas',
      estimatedDepletion: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      trend: 'stable'
    }
  };

  res.json({ success: true, analytics });
});

// GET battery distribution
router.get('/analytics/distribution', (req, res) => {
  const excellent = batteryHistory.filter(h => h.level > 80).length;
  const good = batteryHistory.filter(h => h.level >= 50 && h.level <= 80).length;
  const low = batteryHistory.filter(h => h.level < 50).length;

  res.json({
    success: true,
    distribution: {
      excellent: { count: excellent, percentage: Math.round((excellent / batteryHistory.length) * 100) },
      good: { count: good, percentage: Math.round((good / batteryHistory.length) * 100) },
      low: { count: low, percentage: Math.round((low / batteryHistory.length) * 100) }
    }
  });
});

// GET advanced insights
router.get('/analytics/insights', (req, res) => {
  const avgUsage = ((batteryHistory[0].level - batteryHistory[batteryHistory.length - 1].level) / batteryHistory.length).toFixed(1);

  res.json({
    success: true,
    insights: {
      averageUsagePerHour: `${avgUsage}%`,
      batteryTrend: 'stable',
      recommendations: [
        'Tu uso promedio es 3-4% por hora',
        'La batería se mantiene estable durante el día',
        'Se recomienda cargar antes de las 20:00',
        'Uso más eficiente en modo Conversación'
      ],
      lastUpdated: new Date().toISOString()
    }
  });
});

// ============ PROFILES ============

// GET all profiles
router.get('/profiles', (req, res) => {
  res.json({
    success: true,
    count: userProfiles.length,
    profiles: userProfiles
  });
});

// GET single profile
router.get('/profiles/:profileId', (req, res) => {
  const profile = userProfiles.find(p => p.id === req.params.profileId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Profile not found' });
  }
  res.json({ success: true, profile });
});

// CREATE new profile
router.post('/profiles', (req, res) => {
  const { name, device, programs } = req.body;

  if (!name || !device) {
    return res.status(400).json({ success: false, error: 'Name and device required' });
  }

  const newProfile = {
    id: `profile-${Date.now()}`,
    name,
    device,
    programs: programs || 0,
    active: false,
    createdAt: new Date().toISOString()
  };

  userProfiles.push(newProfile);

  res.status(201).json({
    success: true,
    message: 'Profile created',
    profile: newProfile
  });
});

// UPDATE profile
router.put('/profiles/:profileId', (req, res) => {
  const profile = userProfiles.find(p => p.id === req.params.profileId);

  if (!profile) {
    return res.status(404).json({ success: false, error: 'Profile not found' });
  }

  if (req.body.name) profile.name = req.body.name;
  if (req.body.device) profile.device = req.body.device;
  if (typeof req.body.programs === 'number') profile.programs = req.body.programs;
  if (typeof req.body.active === 'boolean') {
    if (req.body.active) {
      // Deactivate others
      userProfiles.forEach(p => p.active = false);
    }
    profile.active = req.body.active;
  }

  res.json({
    success: true,
    message: 'Profile updated',
    profile
  });
});

// DELETE profile
router.delete('/profiles/:profileId', (req, res) => {
  const index = userProfiles.findIndex(p => p.id === req.params.profileId);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Profile not found' });
  }

  const deleted = userProfiles.splice(index, 1);

  res.json({
    success: true,
    message: 'Profile deleted',
    profile: deleted[0]
  });
});

// ============ SETTINGS ============

// GET user settings
router.get('/settings', (req, res) => {
  res.json({
    success: true,
    settings: userSettings
  });
});

// UPDATE user settings
router.put('/settings', (req, res) => {
  Object.assign(userSettings, req.body);

  res.json({
    success: true,
    message: 'Settings updated',
    settings: userSettings
  });
});

// RESET user settings
router.post('/settings/reset', (req, res) => {
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

  Object.assign(userSettings, defaults);

  res.json({
    success: true,
    message: 'Settings reset to defaults',
    settings: userSettings
  });
});

// ============ ALERTS ============

// GET all alerts
router.get('/alerts', (req, res) => {
  const { type, read } = req.query;
  let filtered = alerts;

  if (type) {
    filtered = filtered.filter(a => a.type === type);
  }

  if (read !== undefined) {
    filtered = filtered.filter(a => a.read === (read === 'true'));
  }

  res.json({
    success: true,
    count: filtered.length,
    unread: filtered.filter(a => !a.read).length,
    alerts: filtered
  });
});

// GET single alert
router.get('/alerts/:alertId', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.alertId);
  if (!alert) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }
  res.json({ success: true, alert });
});

// CREATE alert
router.post('/alerts', (req, res) => {
  const { type, severity, title, message } = req.body;

  if (!type || !severity || !title || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const newAlert = {
    id: `alert-${Date.now()}`,
    type,
    severity,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false
  };

  alerts.unshift(newAlert);

  res.status(201).json({
    success: true,
    message: 'Alert created',
    alert: newAlert
  });
});

// UPDATE alert (mark as read)
router.put('/alerts/:alertId', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.alertId);

  if (!alert) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }

  if (typeof req.body.read === 'boolean') {
    alert.read = req.body.read;
  }

  res.json({
    success: true,
    message: 'Alert updated',
    alert
  });
});

// DELETE alert
router.delete('/alerts/:alertId', (req, res) => {
  const index = alerts.findIndex(a => a.id === req.params.alertId);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }

  const deleted = alerts.splice(index, 1);

  res.json({
    success: true,
    message: 'Alert deleted',
    alert: deleted[0]
  });
});

// MARK ALL as read
router.post('/alerts/mark-all/read', (req, res) => {
  alerts.forEach(a => a.read = true);

  res.json({
    success: true,
    message: 'All alerts marked as read'
  });
});

// DELETE ALL alerts
router.delete('/alerts', (req, res) => {
  const count = alerts.length;
  alerts = [];

  res.json({
    success: true,
    message: `${count} alerts deleted`
  });
});

module.exports = router;
