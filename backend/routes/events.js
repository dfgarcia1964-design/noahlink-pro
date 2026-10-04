import express from 'express';
import { Event, Device } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  try {
    const { deviceId, type, severity, title, message, data } = req.body;

    const device = await Device.findOne({
      _id: deviceId,
      userId: req.userId
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const event = new Event({
      userId: req.userId,
      deviceId,
      type: type || 'info',
      severity: severity || 'info',
      title: title || 'Event',
      message: message || '',
      data: data || {},
      timestamp: new Date()
    });

    await event.save();
    res.status(201).json({ message: 'Event recorded', event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record event' });
  }
});

router.get('/:deviceId', verifyToken, async (req, res) => {
  try {
    const { limit = 50, skip = 0, type, severity } = req.query;

    const device = await Device.findOne({
      _id: req.params.deviceId,
      userId: req.userId
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const filter = {
      userId: req.userId,
      deviceId: req.params.deviceId
    };

    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const events = await Event.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Event.countDocuments(filter);

    res.json({ events, total, limit: parseInt(limit), skip: parseInt(skip) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.put('/:eventId/read', verifyToken, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      userId: req.userId
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.read = true;
    await event.save();

    res.json({ message: 'Event marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.put('/bulk/read', verifyToken, async (req, res) => {
  try {
    const { eventIds } = req.body;

    await Event.updateMany(
      { _id: { $in: eventIds }, userId: req.userId },
      { read: true }
    );

    res.json({ message: 'Events marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update events' });
  }
});

router.get('/stats/unread', verifyToken, async (req, res) => {
  try {
    const unreadCount = await Event.countDocuments({
      userId: req.userId,
      read: false
    });

    const severityCounts = await Event.aggregate([
      { $match: { userId: req.userId, read: false } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    res.json({ unreadCount, bySeverity: severityCounts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event stats' });
  }
});

export default router;
