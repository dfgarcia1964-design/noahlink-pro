/**
 * API Routes v1
 * Rutas para control de audífonos Phonak
 */

const express = require('express');
const router = express.Router();

/**
 * GET /api/v1/devices
 * Listar dispositivos Phonak disponibles
 */
router.get('/devices', async (req, res, next) => {
  try {
    const scanDuration = req.query.duration || 5000;

    const devices = [];

    // Listener temporal para descubrimientos
    const onDiscover = (device) => {
      devices.push(device);
    };

    global.bluetoothManager.on('deviceDiscovered', onDiscover);
    global.bluetoothManager.startScan(scanDuration);

    // Esperar a que termina el escaneo
    setTimeout(() => {
      global.bluetoothManager.removeListener('deviceDiscovered', onDiscover);
      global.bluetoothManager.stopScan();

      res.json({
        success: true,
        count: devices.length,
        devices: devices,
        timestamp: new Date()
      });
    }, scanDuration);

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/devices/:deviceId/connect
 * Conectar a un dispositivo específico
 */
router.post('/devices/:deviceId/connect', async (req, res, next) => {
  try {
    const { deviceId } = req.params;

    const device = await global.bluetoothManager.connect(deviceId);

    res.json({
      success: true,
      message: 'Conectado correctamente',
      device: device
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/devices/:deviceId/disconnect
 * Desconectar de dispositivo
 */
router.post('/devices/:deviceId/disconnect', async (req, res, next) => {
  try {
    await global.bluetoothManager.disconnect();

    res.json({
      success: true,
      message: 'Desconectado correctamente'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/devices/:deviceId/status
 * Obtener estado del dispositivo conectado
 */
router.get('/devices/:deviceId/status', async (req, res, next) => {
  try {
    if (!global.bluetoothManager.isConnected()) {
      return res.status(400).json({
        error: 'No hay dispositivo conectado'
      });
    }

    const device = global.bluetoothManager.getConnectedDevice();
    const battery = await global.bluetoothManager.readBattery();
    const info = await global.bluetoothManager.readDeviceInfo();

    res.json({
      success: true,
      device: {
        ...device,
        ...info,
        battery: battery,
        connected: true
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/devices/:deviceId/battery
 * Obtener nivel de batería
 */
router.get('/devices/:deviceId/battery', async (req, res, next) => {
  try {
    const battery = await global.bluetoothManager.readBattery();

    res.json({
      success: true,
      battery: battery
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/devices/:deviceId/volume
 * Cambiar volumen del audífono
 * Body: { volume: 0-100 }
 */
router.post('/devices/:deviceId/volume', async (req, res, next) => {
  try {
    const { volume } = req.body;

    if (typeof volume !== 'number') {
      return res.status(400).json({
        error: 'Volume debe ser un número'
      });
    }

    const result = await global.bluetoothManager.setVolume(volume);

    res.json({
      success: true,
      result: result
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/status
 * Estado general del sistema
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    bluetooth: {
      isConnected: global.bluetoothManager.isConnected(),
      device: global.bluetoothManager.getConnectedDevice()
    },
    timestamp: new Date()
  });
});

module.exports = router;
