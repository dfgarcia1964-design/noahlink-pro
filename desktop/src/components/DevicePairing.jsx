import React, { useState, useEffect } from 'react';
import useDeviceManager from '../hooks/useDeviceManager';

const DevicePairing = ({ token, onDeviceAdded }) => {
  const [devices, setDevices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const { fetchDevices, addDevice, deleteDevice } = useDeviceManager(token);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await fetchDevices();
      setDevices(data || []);
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDevice({ deviceId, deviceName, model, serialNumber });
      setDeviceId('');
      setDeviceName('');
      setModel('');
      setSerialNumber('');
      setShowForm(false);
      await loadDevices();
      onDeviceAdded?.();
    } catch (error) {
      console.error('Error adding device:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm('¿Estás seguro que deseas eliminar este dispositivo?')) return;
    try {
      await deleteDevice(id);
      await loadDevices();
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  return (
    <div style={{
      backgroundColor: '#1e293b',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #334155'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#f1f5f9' }}>
          🎧 Mis Dispositivos
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showForm ? '✕ Cancelar' : '+ Agregar Dispositivo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddDevice} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                ID Dispositivo
              </label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="device_123"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                Nombre
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Mi Phonak"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                Modelo
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Audeo M"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                Número Serial (opcional)
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="SN123456"
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: loading ? '#64748b' : '#22c55e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? '⏳ Agregando...' : '✅ Agregar Dispositivo'}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {devices.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
            No hay dispositivos emparejados
          </div>
        ) : (
          devices.map(device => (
            <div key={device._id} style={{
              backgroundColor: '#0f172a',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #475569'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>
                🎧 {device.deviceName}
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                {device.model}
              </div>
              <div style={{
                fontSize: '12px',
                color: device.connected ? '#22c55e' : '#ef4444',
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                {device.connected ? '🟢 Conectado' : '🔴 Desconectado'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                🔋 {device.batteryLevel}%
              </div>
              <button
                onClick={() => handleDeleteDevice(device._id)}
                style={{
                  width: '100%',
                  padding: '6px',
                  backgroundColor: '#7f1d1d',
                  color: '#fecaca',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🗑️ Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DevicePairing;
