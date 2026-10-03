import React, { useState } from 'react';
import useDeviceStatus from '../hooks/useDeviceStatus';

const ProgramManager = ({ deviceId, userId = 'user-001' }) => {
  const { device, updateProgram, connected } = useDeviceStatus(deviceId, userId);
  const [loading, setLoading] = useState(false);

  const programs = [
    { id: 'conversation', name: 'Conversación', icon: '👥', description: 'Optimizado para conversación', category: 'standard' },
    { id: 'outdoor', name: 'Aire Libre', icon: '🌳', description: 'Mejor para ambientes ruidosos', category: 'standard' },
    { id: 'quiet', name: 'Silencio', icon: '🤫', description: 'Amplificación reducida', category: 'standard' },
    { id: 'music', name: 'Música', icon: '🎵', description: 'Frecuencias balanceadas', category: 'entertainment' },
    { id: 'phone', name: 'Telefonía', icon: '📱', description: 'Optimizado para llamadas', category: 'communication' },
    { id: 'custom', name: 'Personalizado', icon: '⚙️', description: 'Tu configuración', category: 'custom' }
  ];

  const handleProgramChange = async (programId) => {
    setLoading(true);
    try {
      updateProgram(programId);
      setTimeout(() => setLoading(false), 500);
    } catch (error) {
      console.error('Error changing program:', error);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '700' }}>Gestor de Programas</h2>
        <div style={{
          fontSize: '12px',
          padding: '4px 12px',
          borderRadius: '12px',
          backgroundColor: connected ? '#dcfce7' : '#fecaca',
          color: connected ? '#166534' : '#991b1b',
          fontWeight: '600'
        }}>
          {connected ? '✅ Conectado' : '❌ Desconectado'}
        </div>
      </div>

      {device && (
        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#e0f2fe', borderRadius: '6px', border: '1px solid #0284c7' }}>
          <div style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '600' }}>
            Programa Actual: {device.currentProgram || 'N/A'}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {programs.map((program) => {
          const isSelected = device?.currentProgram === program.id;
          return (
            <button
              key={program.id}
              onClick={() => handleProgramChange(program.id)}
              disabled={loading || !connected}
              style={{
                padding: '16px',
                backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                border: isSelected ? '2px solid #2563eb' : '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: connected && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                opacity: !connected ? 0.6 : 1,
                textAlign: 'center'
              }}
              onMouseOver={(e) => {
                if (connected && !loading) {
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                {program.icon}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: isSelected ? '#ffffff' : '#1f2937',
                marginBottom: '4px'
              }}>
                {program.name}
              </div>
              <div style={{
                fontSize: '11px',
                color: isSelected ? '#e0e7ff' : '#6b7280',
                lineHeight: '1.3'
              }}>
                {program.description}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '12px', color: '#0369a1' }}>
        <strong>Tip:</strong> Puedes cambiar programas en cualquier momento. Los cambios se sincronizan automáticamente con tu dispositivo.
      </div>
    </div>
  );
};

export default ProgramManager;
