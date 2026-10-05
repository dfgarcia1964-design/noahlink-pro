/**
 * BLE Control Routes - Phase 2
 * Rutas REST para control real de audífonos Phonak via BLE
 */

const express = require('express');
const router = express.Router();
const bleManager = require('../bluetooth/ble-manager');
const logger = require('../utils/logger');

/**
 * GET /api/ble/status
 * Obtener estado del gestor BLE
 */
router.get('/status', (req, res) => {
  try {
    const status = bleManager.getStatus();
    res.json({
      success: true,
      status: status
    });
  } catch (error) {
    logger.error('Error obteniendo estado BLE:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ble/scan
 * Iniciar escaneo de dispositivos BLE
 */
router.post('/scan', async (req, res) => {
  try {
    const duration = req.body.duration || 10000;

    if (bleManager.isScanning) {
      return res.status(400).json({
        success: false,
        error: 'Escaneo ya en progreso'
      });
    }

    logger.info(`🔍 Iniciando escaneo BLE (${duration}ms)`);
    await bleManager.startScanning(duration);

    res.json({
      success: true,
      message: 'Escaneo iniciado',
      duration: duration
    });
  } catch (error) {
    logger.error('Error iniciando escaneo:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ble/stop-scan
 * Detener escaneo
 */
router.post('/stop-scan', async (req, res) => {
  try {
    if (!bleManager.isScanning) {
      return res.status(400).json({
        success: false,
        error: 'No hay escaneo en progreso'
      });
    }

    await bleManager.stopScanning();

    res.json({
      success: true,
      message: 'Escaneo detenido',
      devicesFound: bleManager.discoveredDevices.size
    });
  } catch (error) {
    logger.error('Error deteniendo escaneo:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/ble/discovered
 * Obtener lista de dispositivos descubiertos
 */
router.get('/discovered', (req, res) => {
  try {
    const devices = Array.from(bleManager.discoveredDevices.values()).map(d => ({
      id: d.id,
      name: d.name,
      address: d.address,
      rssi: d.rssi,
      discoveredAt: d.discoveredAt
    }));

    res.json({
      success: true,
      count: devices.length,
      devices: devices
    });
  } catch (error) {
    logger.error('Error obteniendo dispositivos:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ble/connect/:deviceId
 * Conectar a un audífono específico
 */
router.post('/connect/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;

    logger.info(`🔌 Conectando a dispositivo: ${deviceId}`);
    const result = await bleManager.connectToDevice(deviceId);

    res.json({
      success: result.success,
      device: result.device,
      services: result.services,
      characteristics: result.characteristics
    });
  } catch (error) {
    logger.error('Error conectando:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ble/disconnect/:deviceId
 * Desconectar audífono
 */
router.post('/disconnect/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;

    await bleManager.disconnectDevice(deviceId);

    res.json({
      success: true,
      message: `Desconectado de dispositivo ${deviceId}`
    });
  } catch (error) {
    logger.error('Error desconectando:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ble/volume/:deviceId
 * Establecer volumen en audífono
 */
router.post('/volume/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { volume } = req.body;

    if (volume === undefined || volume < 0 || volume > 100) {
      return res.status(400).json({
        success: false,
        error: 'Volumen debe estar entre 0-100'
      });
    }

    logger.info(`🔊 Estableciendo volumen ${volume}% en dispositivo ${deviceId}`);
    const result = await bleManager.setVolume(deviceId, volume);

    res.json(result);
  } catch (error) {
    logger.error('Error estableciendo volumen:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ble/program/:deviceId
 * Cambiar programa de audífono
 */
router.post('/program/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { program } = req.body;

    if (!program) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro "program" requerido'
      });
    }

    logger.info(`📻 Cambiando programa a "${program}" en dispositivo ${deviceId}`);
    const result = await bleManager.setProgram(deviceId, program);

    res.json(result);
  } catch (error) {
    logger.error('Error cambiando programa:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/ble/connected
 * Obtener dispositivos conectados
 */
router.get('/connected', (req, res) => {
  try {
    const devices = Array.from(bleManager.connectedDevices.values()).map(d => ({
      id: d.id,
      name: d.name,
      address: d.address,
      rssi: d.rssi,
      connectedAt: d.connectedAt
    }));

    res.json({
      success: true,
      count: devices.length,
      devices: devices
    });
  } catch (error) {
    logger.error('Error obteniendo conectados:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * WebSocket events emitidos por BLEManager
 * Se pueden escuchar en el frontend para actualizaciones en tiempo real
 */

module.exports = router;
