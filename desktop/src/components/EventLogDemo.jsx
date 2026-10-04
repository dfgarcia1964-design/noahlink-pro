import React, { useState, useEffect } from 'react';

const EventLogDemo = ({ device }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Simular eventos
    const demoEvents = [
      { id: 1, timestamp: new Date(Date.now() - 5 * 60000), type: 'VOLUME_CHANGE', description: 'Volumen ajustado a 75%', icon: '🔊' },
      { id: 2, timestamp: new Date(Date.now() - 15 * 60000), type: 'PROGRAM_CHANGE', description: 'Programa cambió a Conversación', icon: '🎵' },
      { id: 3, timestamp: new Date(Date.now() - 30 * 60000), type: 'BATTERY_ALERT', description: 'Batería baja - 20%', icon: '⚠️' },
      { id: 4, timestamp: new Date(Date.now() - 1 * 60 * 60000), type: 'CONNECTED', description: 'Dispositivo conectado', icon: '✅' },
      { id: 5, timestamp: new Date(Date.now() - 2 * 60 * 60000), type: 'SYNC', description: 'Sincronización completada', icon: '🔄' },
    ];
    setEvents(demoEvents);
  }, [device?.id]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700' }}>📝 Registro de Eventos</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              padding: '12px 16px',
              backgroundColor: '#ffffff',
              borderLeft: '4px solid #2563eb',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>{event.icon}</span>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>{event.description}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  {event.timestamp.toLocaleString('es-ES')}
                </div>
              </div>
            </div>
            <span style={{ fontSize: '11px', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '3px' }}>
              {event.type}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '12px', color: '#0369a1' }}>
        ℹ️ Últimos 5 eventos del dispositivo {device?.name}
      </div>
    </div>
  );
};

export default EventLogDemo;
