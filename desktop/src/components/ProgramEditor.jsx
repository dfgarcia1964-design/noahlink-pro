import React from 'react';
import useProgramEditor from '../hooks/useProgramEditor';

const ProgramEditor = ({ initialProgram = null, deviceId, onSave, onCancel }) => {
  const { program, isDirty, loading, updateName, updateIcon, updateSetting, save, cancel } = useProgramEditor(initialProgram);

  const handleSave = async () => {
    const saved = await save(deviceId);
    if (saved && onSave) {
      onSave(saved);
    }
  };

  const handleCancel = () => {
    cancel();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '700' }}>Editor de Programa</h2>
        {isDirty && <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>⚠️ Cambios sin guardar</div>}
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
        {/* Nombre del Programa */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>
            Nombre del Programa
          </label>
          <input
            type="text"
            value={program.name}
            onChange={(e) => updateName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Controles de Ganancia */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700' }}>Ganancia por Frecuencia</h3>

          {[
            { key: 'lowFreq', label: 'Baja (100Hz)', min: 0, max: 12 },
            { key: 'midFreq', label: 'Media (1kHz)', min: 0, max: 12 },
            { key: 'highFreq', label: 'Alta (8kHz)', min: 0, max: 12 }
          ].map((control) => (
            <div key={control.key} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500' }}>{control.label}</label>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb' }}>
                  {program.settings[control.key]}dB
                </span>
              </div>
              <input
                type="range"
                min={control.min}
                max={control.max}
                value={program.settings[control.key]}
                onChange={(e) => updateSetting(control.key, e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>

        {/* Compresión y Ruido */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>
              Compresión: {program.settings.compression.toFixed(1)}x
            </label>
            <input
              type="range"
              min="1"
              max="4"
              step="0.1"
              value={program.settings.compression}
              onChange={(e) => updateSetting('compression', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>
              Reducción Ruido: {program.settings.noise}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={program.settings.noise}
              onChange={(e) => updateSetting('noise', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={loading || !isDirty}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: isDirty ? '#22c55e' : '#d1d5db',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '700',
              cursor: isDirty ? 'pointer' : 'not-allowed',
              opacity: isDirty ? 1 : 0.6
            }}
          >
            {loading ? '⏳ Guardando...' : '✅ Guardar'}
          </button>
          <button
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#f3f4f6',
              color: '#1f2937',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            ✕ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramEditor;
