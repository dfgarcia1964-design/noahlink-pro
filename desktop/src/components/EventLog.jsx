import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/EventLog.css';

const EventLog = ({ deviceId = 'sky-l-90-up-left' }) => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ type: '', severity: '', limit: 50 });
  const [sortOrder, setSortOrder] = useState('desc');

  const EVENT_TYPES = {
    device_connected: { icon: '🔗', label: 'Dispositivo Conectado', color: 'success' },
    device_disconnected: { icon: '🔌', label: 'Dispositivo Desconectado', color: 'danger' },
    volume_changed: { icon: '🔊', label: 'Volumen Cambiado', color: 'info' },
    program_switched: { icon: '🎵', label: 'Programa Cambiado', color: 'info' },
    battery_low: { icon: '🟡', label: 'Batería Baja', color: 'warning' },
    battery_critical: { icon: '🔴', label: 'Batería Crítica', color: 'danger' },
    mute_toggled: { icon: '🔇', label: 'Silencio Activado/Desactivado', color: 'info' },
    error: { icon: '❌', label: 'Error', color: 'danger' },
    settings_changed: { icon: '⚙️', label: 'Configuración Cambiada', color: 'warning' },
    firmware_update: { icon: '📦', label: 'Actualización de Firmware', color: 'success' },
    sync_started: { icon: '🔄', label: 'Sincronización Iniciada', color: 'info' },
    sync_completed: { icon: '✓', label: 'Sincronización Completada', color: 'success' }
  };

  // Load events and stats on mount and when filter changes
  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [deviceId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let url = `/api/v1/devices/${deviceId}/events?limit=${filter.limit}`;

      if (filter.type) url += `&type=${filter.type}`;
      if (filter.severity) url += `&severity=${filter.severity}`;

      const response = await axios.get(url);

      if (response.data.data) {
        let eventsData = response.data.data;

        // Sort by timestamp
        eventsData.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        });

        setEvents(eventsData);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/v1/devices/${deviceId}/events/stats`);
      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleExport = async () => {
    try {
      let url = `/api/v1/devices/${deviceId}/events/export`;

      if (filter.type) url += `?type=${filter.type}`;
      if (filter.severity) url += `${filter.type ? '&' : '?'}severity=${filter.severity}`;

      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `events-${deviceId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting events:', err);
      setError('Error al exportar eventos');
    }
  };

  const handleClearOld = async () => {
    if (window.confirm('¿Eliminar eventos más antiguos de 30 días?')) {
      try {
        await axios.delete(`/api/v1/devices/${deviceId}/events/clear?days=30`);
        fetchEvents();
        fetchStats();
      } catch (err) {
        console.error('Error clearing events:', err);
        setError('Error al limpiar eventos');
      }
    }
  };

  const getEventInfo = (type) => EVENT_TYPES[type] || { icon: '📌', label: type, color: 'default' };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: '🔴',
      error: '❌',
      warning: '🟡',
      info: 'ℹ️'
    };
    return icons[severity] || '📌';
  };

  return (
    <div className="event-log">
      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="close">✕</button>
        </div>
      )}

      {/* Controls */}
      <div className="event-controls">
        <div className="filter-group">
          <label>Tipo de evento:</label>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          >
            <option value="">Todos los eventos</option>
            <option value="device_connected">Conexión</option>
            <option value="program_switched">Programas</option>
            <option value="volume_changed">Volumen</option>
            <option value="battery_low">Batería</option>
            <option value="settings_changed">Configuración</option>
            <option value="error">Errores</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severidad:</label>
          <select
            value={filter.severity}
            onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
          >
            <option value="">Todas</option>
            <option value="critical">Crítico</option>
            <option value="error">Error</option>
            <option value="warning">Advertencia</option>
            <option value="info">Información</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Ordenar:</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Más recientes primero</option>
            <option value="asc">Más antiguos primero</option>
          </select>
        </div>

        <button className="btn secondary" onClick={handleExport} title="Descargar como CSV">
          📥 Exportar
        </button>

        <button className="btn secondary" onClick={handleClearOld} title="Eliminar eventos >30 días">
          🗑️ Limpiar
        </button>
      </div>

      {/* Events List */}
      <div className="events-list">
        {loading ? (
          <div className="loading">Cargando eventos...</div>
        ) : events.length > 0 ? (
          events.map((event) => {
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
              <div
                key={event.id}
                className={`event-item ${eventInfo.color} severity-${event.severity}`}
              >
                <div className="event-marker">
                  <span className="event-icon">{eventInfo.icon}</span>
                </div>

                <div className="event-content">
                  <div className="event-main">
                    <h5>{eventInfo.label}</h5>
                    {event.data && event.data.message && (
                      <p className="event-message">{event.data.message}</p>
                    )}
                    {event.data && Object.keys(event.data).length > 0 && (
                      <div className="event-data">
                        {Object.entries(event.data).map(([key, value]) =>
                          key !== 'message' && (
                            <span key={key} className="data-item">
                              {key}: <strong>{String(value)}</strong>
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <div className="event-meta">
                    <small className="event-time">📅 {timeStr}</small>
                    <span className="event-id">{event.id.substring(0, 12)}...</span>
                  </div>
                </div>

                <div className="event-severity">
                  {getSeverityIcon(event.severity)}
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

      {/* Statistics */}
      {stats && (
        <div className="event-stats">
          <div className="stat-card">
            <label>📊 Total</label>
            <span className="value">{stats.totalEvents}</span>
          </div>
          <div className="stat-card">
            <label>⚠️ Advertencias</label>
            <span className="value">{stats.bySeverity.warning || 0}</span>
          </div>
          <div className="stat-card">
            <label>❌ Errores</label>
            <span className="value">{stats.bySeverity.error || 0}</span>
          </div>
          <div className="stat-card">
            <label>🔴 Críticos</label>
            <span className="value">{stats.bySeverity.critical || 0}</span>
          </div>
          {stats.lastEvent && (
            <div className="stat-card">
              <label>⏰ Último evento</label>
              <span className="value">
                {new Date(stats.lastEvent.timestamp).toLocaleTimeString('es-ES')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventLog;
