/**
 * NoahLink Pro - Aplicación Principal
 * Fase 2: Dashboard Mejorado con monitoreo en tiempo real
 */

import React from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import useDemoData from './hooks/useDemoData';

function App() {
  const { devices, updateVolume, updateProgram, getDeviceEvents } = useDemoData();

  return <Dashboard devices={devices} onUpdateVolume={updateVolume} onUpdateProgram={updateProgram} getDeviceEvents={getDeviceEvents} />;
}

export default App;
