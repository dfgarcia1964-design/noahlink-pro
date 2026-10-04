/**
 * Diagnostics Routes
 * Monitor real Bluetooth connection status
 */

const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const logger = require('../utils/logger');

/**
 * GET /api/diagnostics/bluetooth
 * Check real Bluetooth connection status
 */
router.get('/bluetooth', async (req, res) => {
  try {
    logger.info('📡 Checking Bluetooth connections...');

    // Get all Bluetooth devices using Get-PnpDevice (more reliable than WMI)
    const powershellCommand = `@(Get-PnpDevice -Class Bluetooth -ErrorAction SilentlyContinue | Select-Object FriendlyName, Status) | ConvertTo-Json`;

    const { stdout } = await execPromise(
      `powershell -Command "${powershellCommand}"`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    let devices = [];
    if (stdout && stdout.trim() && stdout.trim() !== '[]') {
      try {
        const parsed = JSON.parse(stdout);
        devices = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
        // Rename FriendlyName to Name for consistency
        devices = devices.map(d => ({
          Name: d.FriendlyName,
          Status: d.Status
        }));
      } catch (e) {
        logger.warn('Could not parse Bluetooth devices:', e.message);
      }
    }

    // Check for Phonak devices specifically
    const phonakDevices = devices.filter(d =>
      d.Name && (d.Name.includes('Phonak') || d.Name.includes('LE_D') || d.Name.includes('D-Phonak'))
    );

    res.json({
      success: true,
      timestamp: new Date(),
      totalBluetoothDevices: devices.length,
      phonakDevicesConnected: phonakDevices.length,
      allDevices: devices,
      phonakDevices: phonakDevices
    });
  } catch (error) {
    logger.error('Error checking Bluetooth', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/diagnostics/device/:id/connection
 * Check if specific device is connected
 */
router.get('/device/:id/connection', async (req, res) => {
  try {
    const { id } = req.params;

    const powershellCommand = `
      $devices = Get-CimInstance -ClassName Win32_PnPDevice -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -like "*Phonak*" -or $_.Name -like "*LE_D*" };

      if ($devices) {
        $devices | Select-Object @{
          Name='DeviceName';
          Expression={$_.Name}
        }, @{
          Name='Status';
          Expression={if($_.Status -eq 'OK') { 'Connected' } else { $_.Status }}
        }, @{
          Name='Description';
          Expression={$_.Description}
        } | ConvertTo-Json -AsArray
      }
    `;

    const { stdout } = await execPromise(
      `powershell -Command "${powershellCommand}"`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    let devices = [];
    if (stdout && stdout.trim()) {
      try {
        const parsed = JSON.parse(stdout);
        devices = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        // No devices found
      }
    }

    const isConnected = devices.length > 0;

    res.json({
      success: true,
      deviceId: id,
      isConnected: isConnected,
      connectedDevices: devices,
      status: isConnected ? 'CONNECTED' : 'DISCONNECTED',
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Error checking device connection', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/diagnostics/system
 * System diagnostics for Bluetooth
 */
router.get('/system', async (req, res) => {
  try {
    logger.info('🔍 Running system diagnostics...');

    // Check Bluetooth service status
    const serviceCommand = `Get-Service -Name "bthserv" -ErrorAction SilentlyContinue | Select-Object -Property Status, DisplayName | ConvertTo-Json`;

    let bluetoothService = {};
    try {
      const { stdout } = await execPromise(
        `powershell -Command "${serviceCommand}"`,
        { encoding: 'utf-8', maxBuffer: 1024 * 1024 }
      );

      if (stdout && stdout.trim()) {
        bluetoothService = JSON.parse(stdout);
      }
    } catch (e) {
      bluetoothService = { error: 'Could not check Bluetooth service' };
    }

    res.json({
      success: true,
      timestamp: new Date(),
      bluetoothService: bluetoothService,
      diagnostics: {
        bluetoothServiceRunning: bluetoothService.Status === 'Running',
        systemReady: bluetoothService.Status === 'Running'
      }
    });
  } catch (error) {
    logger.error('Error running diagnostics', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
