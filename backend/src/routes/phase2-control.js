/**
 * Phase 2: Real Device Control Routes
 * Endpoints for volume, program, and real-time device control
 */

const express = require('express');
const router = express.Router();
const phonakService = require('../services/phonak-service');
const logger = require('../utils/logger');

/**
 * GET /api/device/:id/state
 * Get current device state (battery, volume, program)
 */
router.get('/device/:id/state', (req, res) => {
  try {
    const { id } = req.params;
    const state = phonakService.getDeviceState(id);

    res.json({
      success: true,
      data: state
    });
  } catch (error) {
    logger.error('Error getting device state', error.message);
    res.status(404).json({
      success: false,
      error: 'Device not found'
    });
  }
});

/**
 * POST /api/device/:id/connect
 * Connect to device
 */
router.post('/device/:id/connect', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await phonakService.connectDevice(id);

    res.json(result);
  } catch (error) {
    logger.error('Error connecting device', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/device/:id/disconnect
 * Disconnect from device
 */
router.post('/device/:id/disconnect', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await phonakService.disconnectDevice(id);

    res.json(result);
  } catch (error) {
    logger.error('Error disconnecting device', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/device/:id/volume
 * Set device volume
 * Body: { volume: 0-100 }
 */
router.post('/device/:id/volume', async (req, res) => {
  try {
    const { id } = req.params;
    const { volume } = req.body;

    if (volume === undefined || volume < 0 || volume > 100) {
      return res.status(400).json({
        success: false,
        error: 'Volume must be between 0 and 100'
      });
    }

    const result = await phonakService.setVolume(id, volume);

    res.json(result);
  } catch (error) {
    logger.error('Error setting volume', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/device/:id/program
 * Set audio program
 * Body: { program: "Conversation"|"Music"|etc }
 */
router.post('/device/:id/program', async (req, res) => {
  try {
    const { id } = req.params;
    const { program } = req.body;

    if (!program) {
      return res.status(400).json({
        success: false,
        error: 'Program name required'
      });
    }

    const result = await phonakService.setProgram(id, program);

    res.json(result);
  } catch (error) {
    logger.error('Error setting program', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/device/:id/programs
 * Get available programs for device
 */
router.get('/device/:id/programs', (req, res) => {
  try {
    const { id } = req.params;
    const programs = phonakService.getPrograms(id);

    res.json({
      success: true,
      programs
    });
  } catch (error) {
    logger.error('Error getting programs', error.message);
    res.status(404).json({
      success: false,
      error: 'Device not found'
    });
  }
});

/**
 * GET /api/devices/states
 * Get all devices with current states
 */
router.get('/devices/states', (req, res) => {
  try {
    const states = phonakService.getDeviceStates();

    res.json({
      success: true,
      devices: states
    });
  } catch (error) {
    logger.error('Error getting device states', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
