import React, { useState } from 'react';
import useEventLog from '../hooks/useEventLog';

const EventLog = ({ deviceId, userId = 'user-001' }) => {
  const { events, loading, error, filterByType, filterBySeverity, search, clearFilters, deleteEvent } = useEventLog(deviceId, userId);
  const [activeFilterType, setActiveFilterType] = useState(null);
  const [activeFilterSeverity, setActiveFilterSeverity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const eventsPerPage = 10;
  const totalPages = Math.ceil(events.length / eventsPerPage);
  const startIdx = (currentPage - 1) * eventsPerPage;
  const paginatedEvents = events.slice(startIdx, startIdx + eventsPerPage);

  const getTypeIcon = (type) => {
    const icons = { battery: '🔋', program_switch: '🎵', volume: '🔊', connection: '🔌', error: '❌' };
    return icons[type] || '📝';
  };

  const getSeverityColor = (severity) => {
    const colors = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    return colors[severity] || '#6b7280';
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando eventos...</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700' }}>Historial de Eventos</h2>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Buscar eventos..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value) search(e.target.value);
            else clearFilters();
            setCurrentPage(1);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', borderRadius: '4px', color: '#991b1b', marginBottom: '16px' }}>
          Error: {error}
        </div>
      )}

      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        {paginatedEvents.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
            No hay eventos que mostrar
          </div>
        ) : (
          paginatedEvents.map((event, idx) => (
            <div
              key={event.id || idx}
              style={{
                padding: '12px 16px',
                borderBottom: idx < paginatedEvents.length - 1 ? '1px solid #f3f4f6' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px' }}>{getTypeIcon(event.type)}</span>
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>{event.title || event.type}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: getSeverityColor(event.severity),
                      color: '#ffffff',
                      fontWeight: '600'
                    }}
                  >
                    {event.severity}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '4px' }}>
                  {event.message}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {new Date(event.timestamp).toLocaleString('es-ES')}
                </div>
              </div>

              {event.id && (
                <button
                  onClick={() => deleteEvent(event.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '3px',
                    backgroundColor: '#f3f4f6',
                    cursor: 'pointer',
                    marginLeft: '12px',
                    color: '#6b7280'
                  }}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '3px',
                cursor: 'pointer',
                backgroundColor: currentPage === page ? '#2563eb' : '#ffffff',
                color: currentPage === page ? '#ffffff' : '#1f2937'
              }}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
        Mostrando {startIdx + 1}-{Math.min(startIdx + eventsPerPage, events.length)} de {events.length} eventos
      </div>
    </div>
  );
};

export default EventLog;
