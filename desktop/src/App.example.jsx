import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import axios from 'axios';

/**
 * App.example.jsx - Ejemplo de uso del Dashboard
 * Este archivo muestra cómo integrar el Dashboard con datos reales
 */
const App = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ejemplo con datos mockeados para desarrollo
    const mockDevices = [
      {
        id: 'device-001',
        name: 'Mi Audífono Izquierdo',
        model: 'Phonak Audéo X',
        battery: 87,
        connected: true,
        currentProgram: 'Conversación',
        lastSync: new Date().toISOString(),
        volume: 65,
        signal: -45
      },
      {
        id: 'device-002',
        name: 'Mi Audífono Derecho',
        model: 'Phonak Audéo X',
        battery: 91,
        connected: true,
        currentProgram: 'Conversación',
        lastSync: new Date().toISOString(),
        volume: 65,
        signal: -48
      },
      {
        id: 'device-003',
        name: 'Audífono de Respaldo',
        model: 'Phonak Naída',
        battery: 45,
        connected: false,
        currentProgram: 'Silencio',
        lastSync: new Date(Date.now() - 3600000).toISOString(),
        volume: 45,
        signal: 0
      }
    ];

    setDevices(mockDevices);
    setLoading(false);
  }, []);

  return (
    <Dashboard
      devices={devices}
      loading={loading}
      error={error}
      userId="user-001"
    />
  );
};

export default App;

/*
 * INSTRUCCIONES DE USO:
 * 
 * 1. Reemplazar en desktop/src/App.jsx:
 *    import App from './App.example';
 * 
 * 2. Asegurarse de tener instaladas las dependencias:
 *    npm install axios recharts socket.io-client
 * 
 * 3. El Dashboard renderizará con:
 *    - Lista de dispositivos en la izquierda
 *    - Panel de control con 4 tabs en la derecha
 *    - WebSocket conectado automáticamente
 * 
 * 4. Features disponibles:
 *    - Monitor en Vivo: Muestra batería, volumen, programa
 *    - Batería: Gráfico de tendencias
 *    - Eventos: Historial con filtrado
 *    - Programas: Selector de programas
 * 
 * 5. Datos en tiempo real:
 *    - Los hooks se conectan automáticamente a WebSocket
 *    - Los datos se actualizan cada 30 segundos
 *    - Los eventos se reciben en tiempo real
 */
