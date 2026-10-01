const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noahlink-pro';

// Import routes
const authRoutes = require('./routes/auth-mock'); // Using mock auth while MongoDB is unavailable
const phase3Routes = require('./routes/phase3-mongodb');
const { verifyToken } = require('./middleware/auth');
const deviceDetector = require('./services/device-detector');

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
    console.log(`🎧 Found ${detectedDevices.length} hearing aid(s)`);
    return detectedDevices;
  } catch (error) {
    console.error('Error detecting devices:', error.message);
    return [];
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), bluetooth: connectedDevice ? 'connected' : 'disconnected' });
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
    const result = await deviceDetector.getBatteryInfo(req.params.deviceId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/devices/:deviceId/volume', async (req, res) => {
  try {
    const volumeManager = require('./services/volume-manager');
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
    const volumeManager = require('./services/volume-manager');
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

// ==================== AUTHENTICATION ROUTES ====================
app.use('/api/v1/auth', authRoutes);

// ==================== PHASE 3 ROUTES (PROTECTED) ====================
// Only protect phase3 specific routes
app.use('/api/v1/programs', verifyToken, phase3Routes);
app.use('/api/v1/analytics', verifyToken, phase3Routes);
app.use('/api/v1/profiles', verifyToken, phase3Routes);
app.use('/api/v1/settings', verifyToken, phase3Routes);
app.use('/api/v1/alerts', verifyToken, phase3Routes);

// ==================== MONGODB CONNECTION ====================

const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB conectado exitosamente');
    return true;
  } catch (error) {
    console.warn('⚠️  MongoDB no disponible, usando mock data');
    console.warn(`   Intenta instalar MongoDB localmente o usa: ${MONGODB_URI}`);
    return false;
  }
};

// ==================== SERVER ====================

const server = app.listen(PORT, async () => {
  const dbConnected = await connectMongoDB();

  // Initialize device detection
  const devices = await initializeDevices();

  console.log(`
╔════════════════════════════════════════════════════════╗
║          NoahLink Pro Backend Server                  ║
║          Version 0.5.0 - JWT Authentication           ║
║          🎧 Real Device Detection Enabled             ║
╚════════════════════════════════════════════════════════╝

✅ Servidor escuchando en puerto ${PORT}
${dbConnected ? '✅ MongoDB conectado' : '📝 Usando mock data (MongoDB no disponible)'}
🔐 JWT Authentication habilitado
🎧 Audífonos detectados: ${devices.length}
${devices.length > 0 ? devices.map(d => `   • ${d.name} (${d.model}) - Batería: ${d.battery}%`).join('\n') : '   (Sin audífonos disponibles)'}

📚 ENDPOINTS DISPONIBLES:

Phase 1 (Device Control):
  • GET    /api/v1/devices
  • POST   /api/v1/devices/:deviceId/connect
  • POST   /api/v1/devices/:deviceId/disconnect
  • GET    /api/v1/devices/:deviceId/status
  • GET    /api/v1/devices/:deviceId/battery
  • POST   /api/v1/devices/:deviceId/volume

Phase 3 (Advanced Features):
  📋 Programs:
    • GET    /api/v1/programs
    • GET    /api/v1/programs/:programId
    • POST   /api/v1/programs
    • PUT    /api/v1/programs/:programId
    • DELETE /api/v1/programs/:programId

  📊 Analytics:
    • GET    /api/v1/analytics/trends
    • GET    /api/v1/analytics/distribution
    • GET    /api/v1/analytics/insights

  👤 Profiles:
    • GET    /api/v1/profiles
    • GET    /api/v1/profiles/:profileId
    • POST   /api/v1/profiles
    • PUT    /api/v1/profiles/:profileId
    • DELETE /api/v1/profiles/:profileId

  ⚙️ Settings:
    • GET    /api/v1/settings
    • PUT    /api/v1/settings
    • POST   /api/v1/settings/reset

  🔔 Alerts:
    • GET    /api/v1/alerts
    • GET    /api/v1/alerts/:alertId
    • POST   /api/v1/alerts
    • PUT    /api/v1/alerts/:alertId
    • DELETE /api/v1/alerts/:alertId
    • POST   /api/v1/alerts/mark-all/read
    • DELETE /api/v1/alerts (delete all)

📡 Test: curl http://localhost:${PORT}/health
  `);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Apagando...');
  server.close(() => process.exit(0));
});

module.exports = app;
