import express from 'express';
import { AudioProgram, Device } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

const PRESETS = [
  {
    name: 'Conversation',
    description: 'Optimized for conversations',
    category: 'conversation',
    settings: { lowFreq: 60, midFreq: 70, highFreq: 50, compression: 60, noiseReduction: 40, windNoise: 20, feedback: 50 }
  },
  {
    name: 'Outdoor',
    description: 'Enhanced for outdoor environments',
    category: 'outdoor',
    settings: { lowFreq: 50, midFreq: 60, highFreq: 70, compression: 70, noiseReduction: 70, windNoise: 80, feedback: 40 }
  },
  {
    name: 'Quiet',
    description: 'For quiet environments',
    category: 'quiet',
    settings: { lowFreq: 40, midFreq: 50, highFreq: 60, compression: 40, noiseReduction: 20, windNoise: 10, feedback: 60 }
  },
  {
    name: 'Music',
    description: 'Enhanced music listening',
    category: 'music',
    settings: { lowFreq: 70, midFreq: 60, highFreq: 80, compression: 30, noiseReduction: 10, windNoise: 5, feedback: 70 }
  },
  {
    name: 'Phone',
    description: 'Optimized for phone calls',
    category: 'phone',
    settings: { lowFreq: 55, midFreq: 80, highFreq: 45, compression: 80, noiseReduction: 60, windNoise: 30, feedback: 40 }
  },
  {
    name: 'Custom',
    description: 'Customizable program',
    category: 'custom',
    settings: { lowFreq: 50, midFreq: 50, highFreq: 50, compression: 50, noiseReduction: 30, windNoise: 30, feedback: 50 }
  }
];

router.post('/presets/init', verifyToken, async (req, res) => {
  try {
    const { deviceId } = req.body;

    const device = await Device.findOne({
      _id: deviceId,
      userId: req.userId
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const existingPresets = await AudioProgram.find({
      userId: req.userId,
      deviceId: deviceId,
      isPreset: true
    });

    if (existingPresets.length > 0) {
      return res.json({ message: 'Presets already initialized', count: existingPresets.length });
    }

    const createdPresets = [];
    for (const preset of PRESETS) {
      const program = new AudioProgram({
        userId: req.userId,
        deviceId: deviceId,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        settings: preset.settings,
        isPreset: true,
        isActive: true
      });
      await program.save();
      createdPresets.push(program);
    }

    res.status(201).json({ message: 'Presets initialized', count: createdPresets.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize presets' });
  }
});

router.get('/:deviceId', verifyToken, async (req, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.deviceId,
      userId: req.userId
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const programs = await AudioProgram.find({
      userId: req.userId,
      deviceId: req.params.deviceId
    });

    res.json({ programs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

router.post('/:deviceId', verifyToken, async (req, res) => {
  try {
    const { name, description, settings, category } = req.body;

    const device = await Device.findOne({
      _id: req.params.deviceId,
      userId: req.userId
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const program = new AudioProgram({
      userId: req.userId,
      deviceId: req.params.deviceId,
      name: name || 'Custom Program',
      description: description || '',
      category: category || 'custom',
      settings: settings || {},
      isPreset: false
    });

    await program.save();
    device.programs.push(program._id);
    await device.save();

    res.status(201).json({ message: 'Program created', program });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create program' });
  }
});

router.put('/:deviceId/:programId', verifyToken, async (req, res) => {
  try {
    const { name, description, settings, category } = req.body;

    const program = await AudioProgram.findOne({
      _id: req.params.programId,
      userId: req.userId,
      deviceId: req.params.deviceId
    });

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    if (name) program.name = name;
    if (description !== undefined) program.description = description;
    if (settings) program.settings = { ...program.settings, ...settings };
    if (category) program.category = category;

    program.updatedAt = new Date();
    await program.save();

    res.json({ message: 'Program updated', program });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update program' });
  }
});

router.delete('/:deviceId/:programId', verifyToken, async (req, res) => {
  try {
    const program = await AudioProgram.findOne({
      _id: req.params.programId,
      userId: req.userId,
      deviceId: req.params.deviceId
    });

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    if (program.isPreset) {
      return res.status(403).json({ error: 'Cannot delete preset programs' });
    }

    await AudioProgram.deleteOne({ _id: program._id });

    const device = await Device.findById(req.params.deviceId);
    device.programs = device.programs.filter(p => p.toString() !== program._id.toString());
    await device.save();

    res.json({ message: 'Program deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete program' });
  }
});

export default router;
