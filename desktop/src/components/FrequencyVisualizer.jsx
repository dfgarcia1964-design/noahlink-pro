import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FrequencyVisualizer = ({ settings }) => {
  const frequencies = [
    { freq: '100Hz', gain: settings?.lowFreq || 0 },
    { freq: '250Hz', gain: (settings?.lowFreq || 0) * 0.75 },
    { freq: '500Hz', gain: (settings?.lowFreq || 0) * 0.5 + (settings?.midFreq || 0) * 0.5 },
    { freq: '1kHz', gain: settings?.midFreq || 0 },
    { freq: '2kHz', gain: (settings?.midFreq || 0) * 0.7 + (settings?.highFreq || 0) * 0.3 },
    { freq: '4kHz', gain: (settings?.highFreq || 0) * 0.5 },
    { freq: '8kHz', gain: settings?.highFreq || 0 }
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Respuesta de Frecuencia</h2>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={frequencies}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="freq" />
          <YAxis domain={[0, 12]} />
          <Tooltip />
          <Line type="monotone" dataKey="gain" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FrequencyVisualizer;
