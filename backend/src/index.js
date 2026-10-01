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
const authRoutes = require('./routes/auth');
const phase3Routes = require('./routes/phase3-mongodb');
const { verifyToken } = require('./middleware/auth');

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3001' }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data
const mockDevices = [
  { id: 'naida-001', name: 'Naída UP 90', rssi: -45, model: 'Naída UP 90', serial: 'PH234567AB', firmware: '9.2.5' }
];

let connectedDevice = null;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), bluetooth: connectedDevice ? 'connected' : 'disconnected' });
});

app.get('/api/v1/devices', (req, res) => {
  res.json({ success: true, count: mockDevices.length, devices: mockDevices });
});

app.post('/api/v1/devices/:deviceId/connect', (req, res) => {
  const device = mockDevices.find(d => d.id === req.params.deviceId);
  if (!device) return res.status(404).json({ error: 'Not found' });
  connectedDevice = device;
  res.json({ success: true, device });
});

app.post('/api/v1/devices/:deviceId/disconnect', (req, res) => {
  connectedDevice = null;
  res.json({ success: true });
});

app.get('/api/v1/devices/:deviceId/status', (req, res) => {
  if (!connectedDevice) return res.status(400).json({ error: 'Not connected' });
  res.json({ success: true, device: { ...connectedDevice, battery: { level: 85 } } });
});

app.get('/api/v1/devices/:deviceId/battery', (req, res) => {
  res.json({ success: true, battery: { level: Math.floor(Math.random() * 100), percentage: '85%' } });
});

app.post('/api/v1/devices/:deviceId/volume', (req, res) => {
  const { volume } = req.body;
  if (typeof volume !== 'number') return res.status(400).json({ error: 'Invalid' });
  res.json({ success: true, volume });
});

// ==================== AUTHENTICATION ROUTES ====================
app.use('/api/v1/auth', authRoutes);

// ==================== PHASE 3 ROUTES (PROTECTED) ====================
app.use('/api/v1', verifyToken, phase3Routes);

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
  console.log(`
╔════════════════════════════════════════════════════════╗
║          NoahLink Pro Backend Server                  ║
║          Version 0.5.0 - JWT Authentication           ║
╚════════════════════════════════════════════════════════╝

✅ Servidor escuchando en puerto ${PORT}
${dbConnected ? '✅ MongoDB conectado' : '📝 Usando mock data (MongoDB no disponible)'}
🔐 JWT Authentication habilitado

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
