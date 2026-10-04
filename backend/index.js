import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/mongodb.js';
import { User, Device, BatteryHistory, AudioProgram, Event, SyncQueue } from './models/index.js';
import authRoutes from './routes/auth.js';
import deviceRoutes from './routes/devices.js';
import batteryRoutes from './routes/battery.js';
import programRoutes from './routes/programs.js';
import eventRoutes from './routes/events.js';
import syncRoutes from './routes/sync.js';
import { authLimiter, apiLimiter } from './middleware/rate-limit.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(apiLimiter);

await connectDB();

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/battery', batteryRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/sync', syncRoutes);

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.get('/api/models', (req, res) => {
  res.json({
    models: ['User', 'Device', 'BatteryHistory', 'AudioProgram', 'Event', 'SyncQueue'],
    status: 'MongoDB connected'
  });
});

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ MongoDB connected`);
  console.log(`🔐 Rate limiting enabled`);
});

export default app;
