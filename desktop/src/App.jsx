/**
 * NoahLink Pro - Aplicación Principal
 * Fase 2: Dashboard Mejorado con monitoreo en tiempo real
 */

import React from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import useDemoData from './hooks/useDemoData';

function App() {
  const { devices } = useDemoData();

  return <Dashboard devices={devices} />;
}

export default App;
