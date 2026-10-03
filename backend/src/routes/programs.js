const express = require('express');
const router = express.Router();
const programsService = require('../services/programs-service');
const logger = require('../utils/logger');

router.get('/devices/:deviceId/programs', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { category, search, sort } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) filter.search = search;

    const programs = programsService.getPrograms(deviceId, filter, sort || 'reciente');

    res.json({
      success: true,
      data: programs
    });
  } catch (error) {
    logger.error('Error getting programs', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get programs'
    });
  }
});

router.post('/devices/:deviceId/programs', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { name, icon, category, settings } = req.body;

    const program = programsService.createProgram(deviceId, {
      name,
      icon,
      category,
      settings
    });

    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    logger.error('Error creating program', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create program'
    });
  }
});

router.put('/devices/:deviceId/programs/:programId', (req, res) => {
  try {
    const { deviceId, programId } = req.params;
    const { name, settings, icon, category } = req.body;

    const program = programsService.updateProgram(deviceId, programId, {
      name,
      settings,
      icon,
      category
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    logger.error('Error updating program', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update program'
    });
  }
});

router.delete('/devices/:deviceId/programs/:programId', (req, res) => {
  try {
    const { deviceId, programId } = req.params;

    const deleted = programsService.deleteProgram(deviceId, programId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    res.json({
      success: true,
      message: 'Program deleted'
    });
  } catch (error) {
    logger.error('Error deleting program', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete program'
    });
  }
});

router.post('/devices/:deviceId/programs/:programId/clone', (req, res) => {
  try {
    const { deviceId, programId } = req.params;

    const cloned = programsService.cloneProgram(deviceId, programId);

    if (!cloned) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    res.json({
      success: true,
      data: cloned
    });
  } catch (error) {
    logger.error('Error cloning program', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clone program'
    });
  }
});

router.post('/devices/:deviceId/programs/sync', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { sourcePrograms, targetDevices, mode } = req.body;

    const results = programsService.syncPrograms(
      sourcePrograms || [],
      targetDevices || [],
      mode || 'overwrite'
    );

    res.json({
      success: true,
      syncId: `sync-${Date.now()}`,
      status: 'completed',
      results
    });
  } catch (error) {
    logger.error('Error syncing programs', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync programs'
    });
  }
});

router.get('/devices/:deviceId/programs/presets', (req, res) => {
  try {
    const presets = programsService.getPresets();

    res.json({
      success: true,
      data: presets
    });
  } catch (error) {
    logger.error('Error getting presets', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get presets'
    });
  }
});

router.post('/devices/:deviceId/programs/import', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { programData, overwrite } = req.body;

    if (!programData) {
      return res.status(400).json({
        success: false,
        error: 'Program data required'
      });
    }

    const imported = programsService.importProgram(deviceId, programData, overwrite);

    res.json({
      success: true,
      data: imported
    });
  } catch (error) {
    logger.error('Error importing program', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import program'
    });
  }
});

router.get('/devices/:deviceId/programs/:programId/export', (req, res) => {
  try {
    const { deviceId, programId } = req.params;

    const program = programsService.exportProgram(deviceId, programId);

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=program-${programId}.json`);
    res.send(JSON.stringify(program, null, 2));
  } catch (error) {
    logger.error('Error exporting program', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export program'
    });
  }
});

router.get('/devices/:deviceId/programs/stats', (req, res) => {
  try {
    const { deviceId } = req.params;
    const days = parseInt(req.query.days) || 7;

    const stats = programsService.getProgramStats(deviceId, days);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting program stats', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get program stats'
    });
  }
});

module.exports = router;
