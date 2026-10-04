import React, { useState } from 'react';

const ProgramManagerDemo = ({ device }) => {
  const [currentProgram, setCurrentProgram] = useState(device?.currentProgram || 'Conversation');
  const [feedback, setFeedback] = useState('');

  const programs = [
    { id: 1, name: 'Conversation', icon: '👥', description: 'Para conversaciones en grupo' },
    { id: 2, name: 'Music', icon: '🎵', description: 'Optimizado para música' },
    { id: 3, name: 'Outdoor', icon: '🌳', description: 'Ambiente exterior' },
    { id: 4, name: 'Telephone', icon: '☎️', description: 'Llamadas telefónicas' },
    { id: 5, name: 'Restaurant', icon: '🍽️', description: 'Ruido de restaurante' },
    { id: 6, name: 'Quiet', icon: '🤫', description: 'Ambiente silencioso' },
  ];

  const handleProgramChange = (programName) => {
    setCurrentProgram(programName);
    setFeedback(`✓ Programa cambiado a ${programName}`);
    setTimeout(() => setFeedback(''), 2000);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>🎵 Gestor de Programas</h2>
        {feedback && <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '14px' }}>{feedback}</span>}
      </div>

      <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '2px solid #2563eb' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>PROGRAMA ACTUAL</div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>{currentProgram}</div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#6b7280' }}>PROGRAMAS DISPONIBLES</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {programs.map((program) => (
            <button
              key={program.id}
              onClick={() => handleProgramChange(program.name)}
              style={{
                padding: '16px',
                backgroundColor: currentProgram === program.name ? '#2563eb' : '#ffffff',
                color: currentProgram === program.name ? '#ffffff' : '#1f2937',
                border: currentProgram === program.name ? '2px solid #2563eb' : '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (currentProgram !== program.name) {
                  e.target.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (currentProgram !== program.name) {
                  e.target.style.backgroundColor = '#ffffff';
                }
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{program.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{program.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>{program.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '12px', color: '#0369a1' }}>
        ℹ️ Selecciona un programa para cambiar la configuración de audio en tu dispositivo
      </div>
    </div>
  );
};

export default ProgramManagerDemo;
