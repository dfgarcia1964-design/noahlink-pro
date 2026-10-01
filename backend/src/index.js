const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import Phase 3 routes
const phase3Routes = require('./routes/phase3');

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

// ==================== PHASE 3 ROUTES ====================
app.use('/api/v1', phase3Routes);

// ==================== SERVER ====================

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║          NoahLink Pro Backend Server                  ║
║          Version 0.3.0 - Phase 1+2+3                  ║
╚════════════════════════════════════════════════════════╝

✅ Servidor escuchando en puerto ${PORT}

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
