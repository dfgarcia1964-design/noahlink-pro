import { useState, useEffect } from 'react';

// Almacenamiento global de datos para sincronización entre componentes
let globalDeviceState = {
  'device-1': { volume: 75, program: 'Conversation', battery: 99 },
  'device-2': { volume: 75, program: 'Conversation', battery: 99 }
};

// Historial global de eventos
let globalEvents = [
  { id: 1, timestamp: new Date(Date.now() - 5 * 60000), type: 'CONNECTED', description: 'Dispositivo conectado', icon: '✅', deviceId: 'device-1' }
];

const useDemoData = () => {
  const [devices, setDevices] = useState([]);
  const [events, setEvents] = useState(globalEvents);

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

    // Agregar evento
    const newEvent = {
      id: globalEvents.length + 1,
      timestamp: new Date(),
      type: 'VOLUME_CHANGE',
      description: `Volumen ajustado a ${volume}%`,
      icon: '🔊',
      deviceId
    };
    globalEvents.unshift(newEvent);
    setEvents([...globalEvents]);
  };

  // Función para actualizar programa
  const updateProgram = (deviceId, program) => {
    globalDeviceState[deviceId].program = program;
    setDevices(prev => prev.map(device =>
      device.id === deviceId ? { ...device, currentProgram: program } : device
    ));

    // Agregar evento
    const newEvent = {
      id: globalEvents.length + 1,
      timestamp: new Date(),
      type: 'PROGRAM_CHANGE',
      description: `Programa cambió a ${program}`,
      icon: '🎵',
      deviceId
    };
    globalEvents.unshift(newEvent);
    setEvents([...globalEvents]);
  };

  // Función para obtener eventos de un dispositivo
  const getDeviceEvents = (deviceId) => {
    return globalEvents.filter(e => e.deviceId === deviceId);
  };

  return { devices, updateVolume, updateProgram, events, getDeviceEvents };
};

export default useDemoData;
