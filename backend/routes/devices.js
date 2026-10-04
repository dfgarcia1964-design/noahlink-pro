import express from 'express';
import { Device, User } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.userId }).populate('programs');
    res.json({ devices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { deviceId, deviceName, model, serialNumber } = req.body;

    if (!deviceId || !deviceName || !model) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(409).json({ error: 'Device already exists' });
    }

    const device = new Device({
      userId: req.userId,
      deviceId,
      deviceName,
      model,
      serialNumber
    });

    await device.save();

    const user = await User.findById(req.userId);
    if (!user.devices.includes(device._id)) {
      user.devices.push(device._id);
      await user.save();
    }

    res.status(201).json({ message: 'Device added', device });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add device' });
  }
});

router.get('/:deviceId', verifyToken, async (req, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.deviceId,
      userId: req.userId
    }).populate('programs');

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ device });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

router.put('/:deviceId', verifyToken, async (req, res) => {
  try {
    const { batteryLevel, connected, volume, currentProgram } = req.body;

    const device = await Device.findOne({
      _id: req.params.deviceId,
      userId: req.userId
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (batteryLevel !== undefined) device.batteryLevel = batteryLevel;
    if (connected !== undefined) device.connected = connected;
    if (volume !== undefined) device.volume = volume;
    if (currentProgram !== undefined) device.currentProgram = currentProgram;

    device.updatedAt = new Date();
    device.lastSync = new Date();

    await device.save();

    res.json({ message: 'Device updated', device });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update device' });
  }
});

router.delete('/:deviceId', verifyToken, async (req, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.deviceId,
      userId: req.userId
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    await Device.deleteOne({ _id: device._id });

    const user = await User.findById(req.userId);
    user.devices = user.devices.filter(d => d.toString() !== device._id.toString());
    await user.save();

    res.json({ message: 'Device deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

export default router;
