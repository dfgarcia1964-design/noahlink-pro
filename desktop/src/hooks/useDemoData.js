import { useState, useEffect } from 'react';

const useDemoData = () => {
  const [devices, setDevices] = useState([]);
  const [batteryData, setBatteryData] = useState({});

  useEffect(() => {
    // Datos de demostración de los 2 audífonos detectados
    const demoDevices = [
      {
        id: 'device-1',
        name: 'Phonak Sky L (L)',
        model: 'Sky L 90-UP',
        side: 'Izquierdo (L)',
        battery: 99,
        volume: 75,
        connected: true,
        program: 'Conversation',
        lastSync: new Date()
      },
      {
        id: 'device-2',
        name: 'Phonak Sky L (R)',
        model: 'Sky L 90-UP',
        side: 'Derecho (R)',
        battery: 99,
        volume: 75,
        connected: true,
        program: 'Conversation',
        lastSync: new Date()
      }
    ];

    setDevices(demoDevices);

    // Simular cambios de batería en tiempo real
    const interval = setInterval(() => {
      setDevices(prev => prev.map(device => ({
        ...device,
        battery: Math.max(0, device.battery - Math.random() * 0.5)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { devices, batteryData };
};

export default useDemoData;
