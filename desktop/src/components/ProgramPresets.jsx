import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProgramPresets = ({ deviceId, onSelectPreset }) => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  useEffect(() => {
    fetchPresets();
  }, [deviceId]);

  const fetchPresets = async () => {
    try {
      const res = await axios.get(`${API_BASE}/devices/${deviceId}/programs/presets`);
      if (res.data.success) {
        setPresets(res.data.data || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching presets:', err);
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    if (onSelectPreset) {
      onSelectPreset(preset);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando presets...</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Presets Predefinidos</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            onMouseEnter={() => setHoveredId(preset.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              padding: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: hoveredId === preset.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>
              {preset.icon}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
              {preset.name}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>
              {preset.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProgramPresets;
