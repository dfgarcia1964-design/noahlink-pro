import React, { useState } from 'react';
import '../styles/EventLog.css';

const EventLog = ({ events = [] }) => {
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const eventTypes = {
    device_connected: { icon: '🔗', label: 'Dispositivo Conectado', color: 'success' },
    device_disconnected: { icon: '🔌', label: 'Dispositivo Desconectado', color: 'warning' },
    program_changed: { icon: '🎵', label: 'Programa Cambiado', color: 'info' },
    volume_changed: { icon: '🔊', label: 'Volumen Cambiado', color: 'info' },
    battery_critical: { icon: '🔴', label: 'Batería Crítica', color: 'danger' },
    battery_low: { icon: '🟡', label: 'Batería Baja', color: 'warning' },
    battery_charging: { icon: '⚡', label: 'Cargando', color: 'success' },
    settings_updated: { icon: '⚙️', label: 'Configuración Actualizada', color: 'info' },
  };

  // Filtrar eventos
  let filteredEvents = events;
  if (filter !== 'all') {
    filteredEvents = events.filter(e => e.type === filter);
  }

  // Ordenar eventos
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const getEventInfo = (type) => eventTypes[type] || { icon: '📌', label: type, color: 'default' };

  return (
    <div className="event-log">
      {/* Controles */}
      <div className="event-controls">
        <div className="filter-group">
          <label>Filtrar por tipo:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todos los eventos</option>
            <option value="device_connected">Conexión</option>
            <option value="program_changed">Programas</option>
            <option value="volume_changed">Volumen</option>
            <option value="battery_low">Batería</option>
            <option value="settings_updated">Configuración</option>
          </select>
        </div>

        <div className="sort-group">
          <label>Ordenar:</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Más recientes primero</option>
            <option value="asc">Más antiguos primero</option>
          </select>
        </div>

        <button className="btn secondary">
          📥 Exportar
        </button>
      </div>

      {/* Lista de Eventos */}
      <div className="events-list">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => {
            const eventInfo = getEventInfo(event.type);
            const eventTime = new Date(event.timestamp);
            const timeStr = eventTime.toLocaleString('es-ES', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div key={event.id} className={`event-item ${eventInfo.color}`}>
                <div className="event-marker">
                  <span className="event-icon">{eventInfo.icon}</span>
                </div>

                <div className="event-content">
                  <div className="event-main">
                    <h5>{eventInfo.label}</h5>
                    <p>{event.message}</p>
                  </div>

                  <div className="event-time">
                    <small>
                      📅 {timeStr}
                    </small>
                  </div>
                </div>

                <div className="event-severity">
                  {event.severity === 'critical' && '🔴'}
                  {event.severity === 'warning' && '🟡'}
                  {event.severity === 'info' && 'ℹ️'}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-events">
            <p>📭 No hay eventos con este filtro</p>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="event-stats">
        <div className="stat-card">
          <label>Total de eventos</label>
          <span className="value">{events.length}</span>
        </div>
        <div className="stat-card">
          <label>Hoy</label>
          <span className="value">
            {events.filter(e => {
              const eventDate = new Date(e.timestamp);
              const today = new Date();
              return eventDate.toDateString() === today.toDateString();
            }).length}
          </span>
        </div>
        <div className="stat-card">
          <label>Alertas</label>
          <span className="value">
            {events.filter(e => e.severity !== 'info').length}
          </span>
        </div>
        <div className="stat-card">
          <label>Últimas 24h</label>
          <span className="value">
            {events.filter(e => {
              const eventTime = new Date(e.timestamp);
              const oneDay = 24 * 60 * 60 * 1000;
              return Date.now() - eventTime.getTime() < oneDay;
            }).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventLog;
