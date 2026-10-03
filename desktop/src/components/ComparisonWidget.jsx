import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import useAnalyticsData from '../hooks/useAnalyticsData';

const ComparisonWidget = ({ devices = [] }) => {
  const [selectedDevices, setSelectedDevices] = useState(devices.slice(0, 2).map(d => d.id));
  const { data, loading } = useAnalyticsData(selectedDevices);

  const toggleDeviceSelection = (deviceId) => {
    setSelectedDevices(prev =>
      prev.includes(deviceId)
        ? prev.filter(d => d !== deviceId)
        : [...prev, deviceId]
    );
  };

  const comparisonData = selectedDevices.map(deviceId => {
    const deviceData = data.find(d => d.deviceId === deviceId);
    return {
      name: devices.find(d => d.id === deviceId)?.name || deviceId,
      usage: deviceData?.usageStats?.totalUsageHours || 0,
      sessions: deviceData?.usageStats?.sessionCount || 0,
      battery: deviceData?.batteryStats?.currentBattery || 0
    };
  });

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Comparando...</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Comparar Dispositivos</h2>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Dispositivos a Comparar</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {devices.map(device => (
            <button
              key={device.id}
              onClick={() => toggleDeviceSelection(device.id)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: selectedDevices.includes(device.id) ? '#2563eb' : '#ffffff',
                color: selectedDevices.includes(device.id) ? '#ffffff' : '#1f2937'
              }}
            >
              {device.name}
            </button>
          ))}
        </div>
      </div>

      {comparisonData.length > 0 && (
        <>
          <div style={{
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            marginBottom: '16px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Gráfico Comparativo</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usage" fill="#2563eb" name="Uso (horas)" />
                <Bar dataKey="battery" fill="#22c55e" name="Batería (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Tabla Comparativa</h3>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600' }}>Dispositivo</th>
                  <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600' }}>Uso (h)</th>
                  <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600' }}>Sesiones</th>
                  <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600' }}>Batería (%)</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px' }}>{row.name}</td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>{row.usage}</td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>{row.sessions}</td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: row.battery >= 50 ? '#dcfce7' : '#fee2e2',
                        color: row.battery >= 50 ? '#166534' : '#991b1b',
                        fontWeight: '600'
                      }}>
                        {row.battery}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonWidget;
