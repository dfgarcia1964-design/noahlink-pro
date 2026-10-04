/**
 * NoahLink Pro - Aplicación Principal
 * Fase 2: Dashboard Mejorado con monitoreo en tiempo real
 * UPDATED: Real device data from backend
 */

import React from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import useRealDevices from './hooks/useRealDevices';

function App() {
  const { devices, loading, error, mode, updateVolume, updateProgram, getDeviceEvents } = useRealDevices();

  return (
    <Dashboard
      devices={devices}
      loading={loading}
      error={error}
      mode={mode}
      onUpdateVolume={updateVolume}
      onUpdateProgram={updateProgram}
      getDeviceEvents={getDeviceEvents}
    />
  );
}

export default App;
