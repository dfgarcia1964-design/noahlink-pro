import express from 'express';
import { BatteryHistory, Device } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  try {
    const { deviceId, level, drainRate, isCharging, temperature } = req.body;

    const device = await Device.findOne({
      _id: deviceId,
      userId: req.userId
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const estimate = level > 0 ? Math.ceil((level / (drainRate || 1)) * 24) : 0;

    const history = new BatteryHistory({
      userId: req.userId,
      deviceId,
      timestamp: new Date(),
      level,
      drainRate: drainRate || 0,
      isCharging: isCharging || false,
      temperature: temperature || null,
      estimatedHoursRemaining: estimate
    });

    await history.save();
    res.status(201).json({ message: 'Battery history recorded', history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record battery history' });
  }
});

router.get('/:deviceId', verifyToken, async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const device = await Device.findOne({
      _id: req.params.deviceId,
      userId: req.userId
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const days = range === '7d' ? 7 : range === '30d' ? 30 : 1;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await BatteryHistory.find({
      userId: req.userId,
      deviceId: req.params.deviceId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });

    res.json({ history, range, days });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch battery history' });
  }
});

router.get('/:deviceId/stats', verifyToken, async (req, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.deviceId,
      userId: req.userId
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const history = await BatteryHistory.find({
      userId: req.userId,
      deviceId: req.params.deviceId,
      timestamp: { $gte: sevenDaysAgo }
    }).sort({ timestamp: -1 });

    if (history.length === 0) {
      return res.json({
        avgDrainRate: 0,
        maxDrain: 0,
        minLevel: 100,
        maxLevel: 100,
        avgLevel: 100
      });
    }

    const levels = history.map(h => h.level);
    const drainRates = history.map(h => h.drainRate).filter(d => d > 0);

    const stats = {
      avgDrainRate: drainRates.length > 0 ? (drainRates.reduce((a, b) => a + b) / drainRates.length) : 0,
      maxDrain: Math.max(...drainRates, 0),
      minLevel: Math.min(...levels),
      maxLevel: Math.max(...levels),
      avgLevel: Math.round(levels.reduce((a, b) => a + b) / levels.length)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch battery stats' });
  }
});

export default router;
