const deviceDetector = require('./src/services/device-detector');

(async () => {
  console.log("Testing deviceDetector...");
  console.log("Platform:", deviceDetector.platform);
  console.log("Calling scanDevices()...");
  const devices = await deviceDetector.scanDevices();
  console.log("Devices returned:", devices);
})();
