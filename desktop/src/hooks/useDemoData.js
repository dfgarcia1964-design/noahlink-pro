import { useState, useEffect } from 'react';

// Almacenamiento global de datos para sincronización entre componentes
let globalDeviceState = {
  'device-1': { volume: 75, program: 'Conversation', battery: 99 },
  'device-2': { volume: 75, program: 'Conversation', battery: 99 }
};

const useDemoData = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    // Datos de demostración de los 2 audífonos detectados
    const demoDevices = [
      {
        id: 'device-1',
        name: 'Phonak Sky L (L)',
        model: 'Sky L 90-UP',
        side: 'Izquierdo (L)',
        battery: globalDeviceState['device-1'].battery,
        volume: globalDeviceState['device-1'].volume,
        connected: true,
        currentProgram: globalDeviceState['device-1'].program,
        lastSync: new Date()
      },
      {
        id: 'device-2',
        name: 'Phonak Sky L (R)',
        model: 'Sky L 90-UP',
        side: 'Derecho (R)',
        battery: globalDeviceState['device-2'].battery,
        volume: globalDeviceState['device-2'].volume,
        connected: true,
        currentProgram: globalDeviceState['device-2'].program,
        lastSync: new Date()
      }
    ];

    setDevices(demoDevices);

    // Simular cambios de batería en tiempo real
    const interval = setInterval(() => {
      setDevices(prev => prev.map(device => {
        const newBattery = Math.max(0, device.battery - Math.random() * 0.5);
        globalDeviceState[device.id].battery = newBattery;
        return {
          ...device,
          battery: newBattery,
          volume: globalDeviceState[device.id].volume,
          currentProgram: globalDeviceState[device.id].program
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Función para actualizar volumen
  const updateVolume = (deviceId, volume) => {
    globalDeviceState[deviceId].volume = volume;
    setDevices(prev => prev.map(device =>
      device.id === deviceId ? { ...device, volume } : device
    ));
  };

  // Función para actualizar programa
  const updateProgram = (deviceId, program) => {
    globalDeviceState[deviceId].program = program;
    setDevices(prev => prev.map(device =>
      device.id === deviceId ? { ...device, currentProgram: program } : device
    ));
  };

  return { devices, updateVolume, updateProgram };
};

export default useDemoData;
