import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { syncLimiter } from '../middleware/rate-limit.js';
import syncService from '../services/sync-service.js';

const router = express.Router();

router.post('/queue', verifyToken, syncLimiter, async (req, res) => {
  try {
    const { deviceId, operation, priority } = req.body;
    const item = await syncService.addToSyncQueue(req.userId, deviceId, operation, priority);
    res.status(201).json({ message: 'Added to sync queue', item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to sync queue' });
  }
});

router.post('/process', verifyToken, syncLimiter, async (req, res) => {
  try {
    const result = await syncService.processSyncQueue(req.userId);
    res.json({ message: 'Sync queue processed', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process sync queue' });
  }
});

router.get('/status', verifyToken, async (req, res) => {
  try {
    const status = await syncService.getSyncStatus(req.userId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

router.post('/clear-failed', verifyToken, async (req, res) => {
  try {
    const count = await syncService.clearFailedItems(req.userId);
    res.json({ message: 'Failed items cleared', count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear items' });
  }
});

router.post('/resync-device/:deviceId', verifyToken, syncLimiter, async (req, res) => {
  try {
    const item = await syncService.resyncDevice(req.userId, req.params.deviceId);
    res.json({ message: 'Device resync queued', item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resync device' });
  }
});

export default router;
