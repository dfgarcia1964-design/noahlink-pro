import React, { useState } from 'react';

// Global firmware state
let globalFirmwareState = {
  'device-1': {
    current: '1.0.4.0',
    latest: '1.0.5.2',
    hardware: '2.1.0',
    bootloader: '1.2.0',
    buildDate: '2026-09-15',
    serial: '2346X3WUN',
    lastUpdated: '2026-08-20'
  },
  'device-2': {
    current: '1.0.4.0',
    latest: '1.0.5.2',
    hardware: '2.1.0',
    bootloader: '1.2.0',
    buildDate: '2026-09-15',
    serial: '2344X0TMU',
    lastUpdated: '2026-08-20'
  }
};

const FirmwareInfo = ({ device }) => {
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fw = globalFirmwareState[device?.id] || globalFirmwareState['device-1'];
  const hasUpdate = fw.current !== fw.latest;

  const handleUpdate = () => {
    if (!hasUpdate) return;

    // Confirmación
    const confirmed = window.confirm(
      `¿Actualizar firmware de ${fw.current} a ${fw.latest}?\n\nEsta operación puede tomar 5-10 minutos.`
    );

    if (!confirmed) return;

    setUpdating(true);

    // Simular actualización
    setTimeout(() => {
      // Actualizar versión actual
      globalFirmwareState[device.id].current = globalFirmwareState[device.id].latest;
      globalFirmwareState[device.id].lastUpdated = new Date().toISOString().split('T')[0];

      setUpdating(false);
      setUpdateSuccess(true);

      // Mostrar éxito
      alert(`✅ ¡Firmware actualizado exitosamente!\n\nAhora ejecutando v${fw.latest}\nDispositivo: ${device.name}`);

      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setUpdateSuccess(false), 5000);
    }, 3000);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>📦 Información de Firmware</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {updateSuccess && (
            <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '14px' }}>✅ ¡Actualizado!</span>
          )}
          {hasUpdate && (
            <button
              onClick={handleUpdate}
              disabled={updating}
              style={{
                padding: '8px 16px',
                backgroundColor: updating ? '#9ca3af' : '#f59e0b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: updating ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              {updating ? '⏳ Actualizando...' : '⬆️ Actualizar Ahora'}
            </button>
          )}
        </div>
      </div>

      {/* Versiones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Versión Actual */}
        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>VERSIÓN ACTUAL</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>{fw.current}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            ✓ Instalado
          </div>
        </div>

        {/* Versión Disponible */}
        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: hasUpdate ? '2px solid #f59e0b' : '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>VERSIÓN DISPONIBLE</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: hasUpdate ? '#f59e0b' : '#22c55e' }}>{fw.latest}</div>
          <div style={{ fontSize: '12px', color: hasUpdate ? '#b45309' : '#22c55e', marginTop: '8px', fontWeight: '600' }}>
            {hasUpdate ? '⚠️ Actualización disponible' : '✅ Última versión'}
          </div>
        </div>

        {/* Hardware Version */}
        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>VERSION HARDWARE</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{fw.hardware}</div>
        </div>

        {/* Bootloader Version */}
        <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>BOOTLOADER</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{fw.bootloader}</div>
        </div>
      </div>

      {/* Detalles */}
      <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>📋 Detalles del Dispositivo</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280', fontWeight: '500' }}>Serial:</span>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>{fw.serial}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280', fontWeight: '500' }}>Fecha de Build:</span>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>{fw.buildDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280', fontWeight: '500' }}>Última Actualización:</span>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>{fw.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Características */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#0369a1' }}>ℹ️ Notas de Versión</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#0369a1', lineHeight: '1.8' }}>
          {fw.current === fw.latest ? (
            <li>✅ Tienes la última versión del firmware</li>
          ) : (
            <>
              <li>🔧 Mejoras de rendimiento y estabilidad</li>
              <li>🐛 Correcciones de bugs críticos</li>
              <li>🔊 Optimización de audio mejorada</li>
              <li>⚡ Mayor duración de batería</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FirmwareInfo;
