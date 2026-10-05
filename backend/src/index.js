const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

require('dotenv').config();

const logger = require('./utils/logger');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noahlink-pro';

// Phase 2: WebSocket setup
const http = require('http');
const socketIo = require('socket.io');
const WebSocketManager = require('./services/websocket-manager');

// Create HTTP server for Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Initialize WebSocket Manager
const wsManager = new WebSocketManager(io);
wsManager.initializeServer();

// Make wsManager available globally
global.wsManager = wsManager;

// Import routes
const authRoutes = require('./routes/auth-mock'); // Using mock auth while MongoDB is unavailable
const phase3Routes = require('./routes/phase3-mongodb');
const phase2ControlRoutes = require('./routes/phase2-control'); // Phase 2: Real device control
const diagnosticsRoutes = require('./routes/diagnostics'); // Diagnostics: Bluetooth status
const batteryRoutes = require('./routes/battery'); // Phase 2: Battery history
const eventsRoutes = require('./routes/events'); // Phase 2: Event logging
const websocketRoutes = require('./routes/websocket'); // Phase 2: WebSocket management
const bleAdvancedRoutes = require('./routes/ble-advanced'); // Advanced BLE control
const { verifyToken } = require('./middleware/auth');
const deviceDetector = require('./services/device-detector');
const phonakService = require('./services/phonak-service'); // Phase 2: Phonak control
const volumeManager = require('./services/volume-manager');
const batteryManager = require('./services/battery-manager');
const analyticsService = require('./services/analytics');
const eventManager = require('./services/event-manager');
const customProgramsManager = require('./services/custom-programs');
const programManager = require('./services/program-manager');

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3001' }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Device storage
let detectedDevices = [];
let connectedDevice = null;

// Initialize device detection
async function initializeDevices() {
  try {
    detectedDevices = await deviceDetector.scanDevices();
    logger.info(`Found ${detectedDevices.length} hearing aid(s)`);
    return detectedDevices;
  } catch (error) {
    logger.error('Error detecting devices', error.message);
    return [];
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), bluetooth: connectedDevice ? 'connected' : 'disconnected' });
});

// NEW: Get current app mode (REAL or DEMO)
app.get('/api/status/mode', (req, res) => {
  try {
    const modeStatus = deviceDetector.getModeStatus();
    res.json({
      success: true,
      mode: modeStatus.mode,
      deviceCount: modeStatus.deviceCount,
      isScanning: modeStatus.isScanning,
      connectedCount: modeStatus.connectedCount,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Error getting mode status', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get mode status'
    });
  }
});

app.get('/api/v1/devices', async (req, res) => {
  try {
    const devices = detectedDevices.length > 0 ? detectedDevices : await initializeDevices();
    res.json({
      success: true,
      count: devices.length,
      devices,
      source: 'Real devices detected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/v1/devices/:deviceId/connect', async (req, res) => {
  try {
    const result = await deviceDetector.connectDevice(req.params.deviceId);
    if (result.success) {
      connectedDevice = result.device;
      res.json({ success: true, device: result.device, connectedAt: result.connectedAt });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/devices/:deviceId/disconnect', async (req, res) => {
  try {
    const result = await deviceDetector.disconnectDevice(req.params.deviceId);
    connectedDevice = null;
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/status', async (req, res) => {
  try {
    if (!connectedDevice) {
      return res.status(400).json({ error: 'Not connected' });
    }
    const details = await deviceDetector.getDeviceDetails(req.params.deviceId);
    res.json({ success: true, device: details });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/battery', async (req, res) => {
  try {
    const level = batteryManager.getBatteryLevel(req.params.deviceId);
    const status = batteryManager.getBatteryStatus(level);

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      battery: level,
      status: status.status,
      statusLabel: status.label,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/battery/history', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const history = batteryManager.getHistory(req.params.deviceId, hours);

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      hours,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/volume', async (req, res) => {
  try {
    const currentVolume = volumeManager.getVolume(req.params.deviceId) || 50;
    res.json({
      success: true,
      deviceId: req.params.deviceId,
      volume: currentVolume,
      description: volumeManager.getVolumeDescription(currentVolume)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/devices/:deviceId/volume', async (req, res) => {
  try {
    const { volume } = req.body;
    if (typeof volume !== 'number' || volume < 0 || volume > 100) {
      return res.status(400).json({ error: 'Invalid volume (0-100)' });
    }
    volumeManager.setVolume(req.params.deviceId, volume);
    const result = await deviceDetector.setVolume(req.params.deviceId, volume);
    res.json({
      success: true,
      deviceId: req.params.deviceId,
      volume: volume,
      description: volumeManager.getVolumeDescription(volume)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PROGRAM ENDPOINTS ====================
app.get('/api/v1/programs', (req, res) => {
  try {
    const programs = programManager.getAllPrograms();
    res.json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/programs', (req, res) => {
  try {
    const programs = programManager.getAllPrograms();
    const activeProgram = programManager.getActiveProgram(req.params.deviceId);

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      activeProgram: activeProgram.id,
      programs: programs,
      count: programs.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/devices/:deviceId/programs/:programId/switch', (req, res) => {
  try {
    const result = programManager.switchProgram(
      req.params.deviceId,
      req.params.programId
    );

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      activeProgram: req.params.programId,
      program: programManager.getProgram(req.params.programId),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/programs/:programId', (req, res) => {
  try {
    const program = programManager.getProgram(req.params.programId);

    if (!program) {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }

    const stats = programManager.getProgramStats(req.params.programId);

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      program: program,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/programs/history/:limit?', (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 20;
    const history = programManager.getProgramHistory(req.params.deviceId, limit);

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== EVENT LOGGING ENDPOINTS ====================
app.get('/api/v1/devices/:deviceId/events', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const type = req.query.type;
    const severity = req.query.severity;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let events;

    if (type) {
      events = eventManager.getEventsByType(req.params.deviceId, type, limit);
    } else if (severity) {
      events = eventManager.getEventsBySeverity(req.params.deviceId, severity, limit);
    } else if (startDate && endDate) {
      events = eventManager.getEventsByDateRange(req.params.deviceId, startDate, endDate, limit);
    } else {
      events = eventManager.getEventsByDeviceId(req.params.deviceId, limit);
    }

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      count: events.length,
      filters: { type, severity, startDate, endDate },
      data: events
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/devices/:deviceId/events/log', (req, res) => {
  try {
    const { type, severity, data } = req.body;

    const event = eventManager.logEvent(
      req.params.deviceId,
      type,
      data || {},
      severity || 'info'
    );

    res.json({
      success: true,
      event: event
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/events/stats', (req, res) => {
  try {
    const stats = eventManager.getEventStats(req.params.deviceId);

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/events/export', (req, res) => {
  try {
    const filter = {
      type: req.query.type,
      severity: req.query.severity,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const csv = eventManager.exportAsCSV(req.params.deviceId, filter);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="events-${req.params.deviceId}-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/v1/devices/:deviceId/events/clear', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const result = eventManager.clearOldEvents(req.params.deviceId, days);

    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CUSTOM PROGRAMS ENDPOINTS ====================
app.get('/api/v1/devices/:deviceId/custom-programs', (req, res) => {
  try {
    const programs = customProgramsManager.getAllCustomPrograms(req.params.deviceId);

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/devices/:deviceId/custom-programs', (req, res) => {
  try {
    const { name, description, icon, frequency, gain, metadata } = req.body;

    // Validate
    const validation = customProgramsManager.validateProgram({
      name,
      description,
      icon,
      frequency,
      gain,
      metadata
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const program = customProgramsManager.createProgram(req.params.deviceId, {
      name,
      description,
      icon,
      frequency,
      gain,
      metadata
    });

    res.status(201).json({
      success: true,
      program: program
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/custom-programs/:programId', (req, res) => {
  try {
    const program = customProgramsManager.getCustomProgram(
      req.params.deviceId,
      req.params.programId
    );

    if (!program) {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }

    const stats = customProgramsManager.getProgramStats(program);

    res.json({
      success: true,
      program: program,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/v1/devices/:deviceId/custom-programs/:programId', (req, res) => {
  try {
    const { name, description, icon, frequency, gain, metadata } = req.body;

    // Validate if provided
    if (frequency || gain) {
      const validation = customProgramsManager.validateProgram({
        name: name || 'temp',
        frequency: frequency || [],
        gain: gain || []
      });

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors
        });
      }
    }

    const program = customProgramsManager.updateProgram(
      req.params.deviceId,
      req.params.programId,
      { name, description, icon, frequency, gain, metadata }
    );

    res.json({
      success: true,
      program: program
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/v1/devices/:deviceId/custom-programs/:programId', (req, res) => {
  try {
    const result = customProgramsManager.deleteProgram(
      req.params.deviceId,
      req.params.programId
    );

    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/devices/:deviceId/custom-programs/:programId/duplicate', (req, res) => {
  try {

    const sourceProgram =
      customProgramsManager.getCustomProgram(req.params.deviceId, req.params.programId) ||
      programManager.getProgram(req.params.programId);

    if (!sourceProgram) {
      return res.status(404).json({ success: false, error: 'Source program not found' });
    }

    const newName = req.body.name || `${sourceProgram.name} (Copy)`;
    const program = customProgramsManager.duplicateProgram(
      req.params.deviceId,
      sourceProgram,
      newName
    );

    res.status(201).json({
      success: true,
      program: program
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/devices/:deviceId/custom-programs/:programId/activate', (req, res) => {
  try {
    const program = customProgramsManager.activateProgram(
      req.params.deviceId,
      req.params.programId
    );

    res.json({
      success: true,
      program: program
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== ANALYTICS ENDPOINTS ====================
app.get('/api/v1/devices/:deviceId/analytics/summary', (req, res) => {
  try {

    const events = eventManager.getEventsByDeviceId(req.params.deviceId, 500);
    const batteryHistory = batteryManager.getHistory(req.params.deviceId, 24);
    const stats = analyticsService.calculateUsageStats(events, batteryHistory);

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      stats: stats,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/analytics/insights', (req, res) => {
  try {

    const events = eventManager.getEventsByDeviceId(req.params.deviceId, 500);
    const batteryHistory = batteryManager.getHistory(req.params.deviceId, 24);
    const stats = analyticsService.calculateUsageStats(events, batteryHistory);
    const insights = analyticsService.generateInsights(stats);

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      insights: insights
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/analytics/recommendations', (req, res) => {
  try {

    const events = eventManager.getEventsByDeviceId(req.params.deviceId, 500);
    const batteryHistory = batteryManager.getHistory(req.params.deviceId, 24);
    const stats = analyticsService.calculateUsageStats(events, batteryHistory);
    const allPrograms = programManager.getAllPrograms();

    const recommendations = analyticsService.generateRecommendations(stats, allPrograms, batteryHistory);
    const programRecommendations = analyticsService.recommendPrograms(events, batteryHistory);

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      recommendations: recommendations,
      programRecommendations: programRecommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/analytics/health', (req, res) => {
  try {

    const events = eventManager.getEventsByDeviceId(req.params.deviceId, 500);
    const batteryHistory = batteryManager.getHistory(req.params.deviceId, 24);
    const stats = analyticsService.calculateUsageStats(events, batteryHistory);

    const health = {
      overall: stats.deviceHealth,
      battery: stats.batteryStats,
      errors: stats.usagePatterns.errorsCount,
      lastErrorTime: events
        .reverse()
        .find(e => e.severity === 'error' || e.severity === 'critical')?.timestamp || null
    };

    res.json({
      success: true,
      deviceId: req.params.deviceId,
      health: health
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PUBLIC ROUTES (NO AUTH) ====================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/websocket', websocketRoutes);
app.use('/api/v1/devices/:deviceId/battery', batteryRoutes);
app.use('/api/v1/devices/:deviceId/events', eventsRoutes);

// ==================== PHASE 2: DEVICE CONTROL ROUTES ====================
app.use('/api', phase2ControlRoutes);

// ==================== DIAGNOSTICS ROUTES ====================
app.use('/api/diagnostics', diagnosticsRoutes);

// ==================== ADVANCED BLE ROUTES ====================
app.use('/api/ble', bleAdvancedRoutes);

// ==================== PROTECTED ROUTES ====================
app.use('/api/v1', verifyToken, phase3Routes);

// ==================== MONGODB CONNECTION ====================

const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.success('MongoDB conectado exitosamente');
    return true;
  } catch (error) {
    logger.warn('MongoDB no disponible, usando mock data');
    logger.warn(`Intenta instalar MongoDB localmente o usa: ${MONGODB_URI}`);
    return false;
  }
};

// ==================== SERVER ====================

server.listen(PORT, async () => {
  const dbConnected = await connectMongoDB();

  // Initialize device detection
  const devices = await initializeDevices();

  // Initialize Phonak service (Phase 2)
  try {
    await phonakService.initialize();
  } catch (error) {
    logger.warn('Phonak service initialization failed:', error.message);
  }

  logger.success(`
╔════════════════════════════════════════════════════════╗
║          NoahLink Pro Backend Server                  ║
║          Version 0.5.0 - JWT + WebSocket              ║
║          🎧 Real Device Detection Enabled             ║
║          📡 Real-time Updates (WebSocket)              ║
╚════════════════════════════════════════════════════════╝

✅ Servidor escuchando en puerto ${PORT}
${dbConnected ? '✅ MongoDB conectado' : '📝 Usando mock data (MongoDB no disponible)'}
🔐 JWT Authentication habilitado
📡 WebSocket habilitado (ws://localhost:${PORT})
🎧 Audífonos detectados: ${devices.length}
${devices.length > 0 ? devices.map(d => `   • ${d.name} (${d.model}) - Batería: ${d.battery}%`).join('\n') : '   (Sin audífonos disponibles)'}

📡 Test REST: curl http://localhost:${PORT}/health
📡 Test WebSocket: ws://localhost:${PORT}
  `);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Apagando...');
  server.close(() => process.exit(0));
});

module.exports = app;
