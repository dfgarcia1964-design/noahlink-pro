/**
 * Advanced BLE Routes
 * Control directo de audífonos via Bluetooth Low Energy
 */

const express = require('express');
const router = express.Router();
const bleController = require('../bluetooth/ble-controller');
const logger = require('../utils/logger');

/**
 * GET /api/ble/discover/:deviceAddress
 * Descubre servicios GATT del dispositivo
 */
router.get('/discover/:deviceAddress', async (req, res) => {
  try {
    const { deviceAddress } = req.params;
    logger.info(`🔍 Descubriendo servicios GATT para ${deviceAddress}`);

    const services = await bleController.discoverServices(deviceAddress);
    const characteristics = await bleController.discoverCharacteristics(deviceAddress);

    res.json({
      success: true,
      device: deviceAddress,
      services: services,
      characteristics: characteristics,
      timestamp: new Date(),
      note: 'Servicios y características GATT descubiertos'
    });
  } catch (error) {
    logger.error('Error en descubrimiento GATT:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ble/volume/:deviceAddress
 * Envía comando de volumen via GATT Write
 */
router.post('/volume/:deviceAddress', async (req, res) => {
  try {
    const { deviceAddress } = req.params;
    const { volume } = req.body;

    if (!volume || volume < 0 || volume > 100) {
      return res.status(400).json({
        success: false,
        error: 'Volume debe estar entre 0-100'
      });
    }

    logger.info(`🔊 Enviando comando de volumen ${volume}% a ${deviceAddress}`);

    const result = await bleController.setVolumeViaBLE(deviceAddress, volume);

    res.json({
      success: result.success,
      device: deviceAddress,
      volume: volume,
      command: result.hexValue || null,
      timestamp: result.timestamp,
      note: 'Comando BLE enviado (requiere configuración completa de GATT)'
    });
  } catch (error) {
    logger.error('Error en comando BLE:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ble/status/:deviceAddress
 * Obtiene estado de conexión BLE
 */
router.get('/status/:deviceAddress', async (req, res) => {
  try {
    const { deviceAddress } = req.params;
    const status = bleController.getConnectionStatus(deviceAddress);

    res.json(status);
  } catch (error) {
    logger.error('Error obteniendo estado BLE:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ble/characteristics/:deviceAddress
 * Lee características específicas del dispositivo
 */
router.get('/characteristics/:deviceAddress', async (req, res) => {
  try {
    const { deviceAddress } = req.params;
    logger.info(`🔎 Obteniendo características BLE para ${deviceAddress}`);

    const characteristics = await bleController.discoverCharacteristics(deviceAddress);

    res.json({
      success: true,
      device: deviceAddress,
      characteristics: characteristics,
      timestamp: new Date(),
      note: 'Características GATT disponibles'
    });
  } catch (error) {
    logger.error('Error obteniendo características:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
