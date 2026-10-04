import React, { useState, useEffect } from 'react';

const DiagnosticsPanel = () => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [bluetoothStatus, setBluetoothStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const API_URL = 'http://localhost:3000';

  // Fetch diagnostics
  const fetchDiagnostics = async () => {
    try {
      setLoading(true);

      // Get system diagnostics
      const diagResponse = await fetch(`${API_URL}/api/diagnostics/system`);
      const diagData = await diagResponse.json();
      setDiagnostics(diagData);

      // Get Bluetooth status
      const btResponse = await fetch(`${API_URL}/api/diagnostics/bluetooth`);
      const btData = await btResponse.json();
      setBluetoothStatus(btData);
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    fetchDiagnostics();

    if (autoRefresh) {
      const interval = setInterval(fetchDiagnostics, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (!diagnostics || !bluetoothStatus) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        ⏳ Cargando diagnóstico...
      </div>
    );
  }

  const phonakConnected = bluetoothStatus.phonakDevicesConnected > 0;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>🔧 Diagnóstico de Bluetooth</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-actualizar (3s)
          </label>
          <button
            onClick={fetchDiagnostics}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? '⏳ Actualizando...' : '🔄 Actualizar'}
          </button>
        </div>
      </div>

      {/* Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Bluetooth Service */}
        <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>
            SERVICIO BLUETOOTH
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: diagnostics.diagnostics.bluetoothServiceRunning ? '#22c55e' : '#ef4444'
          }}>
            {diagnostics.diagnostics.bluetoothServiceRunning ? '✅ Activo' : '❌ Inactivo'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            Estado: {diagnostics.bluetoothService.Status || 'Desconocido'}
          </div>
        </div>

        {/* Total Devices */}
        <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>
            DISPOSITIVOS BLUETOOTH
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>
            {bluetoothStatus.totalBluetoothDevices}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            Totales en el sistema
          </div>
        </div>

        {/* Phonak Connected */}
        <div style={{
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: phonakConnected ? '2px solid #22c55e' : '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>
            AUDÍFONOS PHONAK
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: phonakConnected ? '#22c55e' : '#ef4444' }}>
            {bluetoothStatus.phonakDevicesConnected}
          </div>
          <div style={{
            fontSize: '12px',
            color: phonakConnected ? '#15803d' : '#b91c1c',
            marginTop: '8px',
            fontWeight: '600'
          }}>
            {phonakConnected ? '🟢 CONECTADOS' : '🔴 NO CONECTADOS'}
          </div>
        </div>
      </div>

      {/* Phonak Devices List */}
      {bluetoothStatus.phonakDevices && bluetoothStatus.phonakDevices.length > 0 && (
        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#166534' }}>✅ Audífonos Detectados</h4>
          {bluetoothStatus.phonakDevices.map((device, i) => (
            <div key={i} style={{ padding: '12px', backgroundColor: 'white', marginBottom: '8px', borderRadius: '4px', borderLeft: '4px solid #22c55e' }}>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>{device.Name}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Estado: <span style={{ color: '#22c55e', fontWeight: '600' }}>{device.Status}</span>
              </div>
              {device.Description && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {device.Description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All Devices List */}
      {bluetoothStatus.allDevices && bluetoothStatus.allDevices.length > 0 && (
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ margin: '0 0 12px 0' }}>📡 Todos los Dispositivos Bluetooth ({bluetoothStatus.allDevices.length})</h4>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {bluetoothStatus.allDevices.map((device, i) => (
              <div key={i} style={{
                padding: '12px',
                backgroundColor: 'white',
                marginBottom: '8px',
                borderRadius: '4px',
                fontSize: '12px',
                borderLeft: device.Name?.includes('Phonak') ? '4px solid #2563eb' : '4px solid #d1d5db'
              }}>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>{device.Name}</div>
                <div style={{ color: '#6b7280', marginTop: '4px' }}>Status: {device.Status}</div>
                {device.Description && (
                  <div style={{ color: '#9ca3af', marginTop: '2px', fontSize: '11px' }}>
                    {device.Description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#92400e' }}>📋 Pasos para conectar audífonos:</h4>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#b45309', fontSize: '14px', lineHeight: '1.8' }}>
          <li>Activa Bluetooth en tus audífonos Phonak</li>
          <li>Espera a que aparezcan en "Audífonos Detectados" (arriba)</li>
          <li>El contador mostrará "🟢 CONECTADOS"</li>
          <li>La app controlará automáticamente volumen y programas</li>
          <li>Los cambios se verán en tiempo real en la batería</li>
        </ol>
      </div>

      {/* Last Update */}
      <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af', textAlign: 'right' }}>
        Última actualización: {new Date(bluetoothStatus.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default DiagnosticsPanel;
