const os = require('os');

console.log("Testing device detector...");
console.log("Platform:", os.platform());

// Simulate the detector
const detector = {
  platform: os.platform(),
  async scanDevices() {
    console.log("scanDevices() called with platform:", this.platform);
    if (this.platform === 'win32') {
      console.log("Windows detected, returning Sky 90 devices");
      return [
        {
          id: 'sky-90-left',
          name: 'Phonak Sky 90 (L)',
          model: 'Sky 90',
          firmware: '5.1.2',
          battery: 85,
          rssi: -55,
          serial: 'PH-SKY90-L-001'
        },
        {
          id: 'sky-90-right',
          name: 'Phonak Sky 90 (R)',
          model: 'Sky 90',
          firmware: '5.1.2',
          battery: 88,
          rssi: -52,
          serial: 'PH-SKY90-R-001'
        }
      ];
    }
    return [];
  }
};

(async () => {
  const devices = await detector.scanDevices();
  console.log("Devices found:", JSON.stringify(devices, null, 2));
})();
