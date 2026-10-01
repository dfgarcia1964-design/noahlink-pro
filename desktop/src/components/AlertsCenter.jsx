import React, { useState } from 'react';
import '../styles/AlertsCenter.css';

const AlertsCenter = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'battery', severity: 'warning', title: 'Batería Baja', message: 'Nivel de batería en 18%. Se recomienda cargar pronto.', timestamp: '2026-10-01 14:35', read: false },
    { id: 2, type: 'system', severity: 'info', title: 'Actualización Disponible', message: 'Nueva versión 1.2.5 disponible para descargar.', timestamp: '2026-10-01 12:15', read: false },
    { id: 3, type: 'connection', severity: 'error', title: 'Conexión Perdida', message: 'Conexión con el dispositivo interrumpida. Reintentando...', timestamp: '2026-10-01 11:20', read: true },
    { id: 4, type: 'program', severity: 'success', title: 'Programa Guardado', message: 'El programa "Reunión" se guardó correctamente.', timestamp: '2026-10-01 10:45', read: true },
    { id: 5, type: 'maintenance', severity: 'info', title: 'Mantenimiento Programado', message: 'Se realizará mantenimiento el 15 de octubre.', timestamp: '2026-10-01 09:30', read: true },
  ]);

  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const getAlertIcon = (type) => {
    const icons = {
      battery: '🔋',
      system: '⚙️',
      connection: '🔌',
      program: '🎵',
      maintenance: '🔧',
    };
    return icons[type] || '📢';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      success: '#10b981',
    };
    return colors[severity] || '#6366f1';
  };

  const handleMarkAsRead = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const handleDeleteAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
  };

  const handleClearAll = () => {
    if (window.confirm('¿Eliminar todas las alertas?')) {
      setAlerts([]);
    }
  };

  let filteredAlerts = alerts;
  if (filterType !== 'all') {
    filteredAlerts = alerts.filter(a => a.type === filterType);
  }

  if (sortOrder === 'oldest') {
    filteredAlerts = [...filteredAlerts].reverse();
  }

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="alerts-center">
      <div className="alerts-header">
        <div className="header-title">
          <h2>🔔 Centro de Alertas</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} nuevas</span>
          )}
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="btn-action" onClick={handleMarkAllAsRead}>
              ✓ Marcar como leído
            </button>
          )}
          {alerts.length > 0 && (
            <button className="btn-action danger" onClick={handleClearAll}>
              🗑️ Limpiar todo
            </button>
          )}
        </div>
      </div>

      <div className="alerts-controls">
        <div className="filter-group">
          <label>Filtrar por tipo:</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Todos
            </button>
            <button
              className={`filter-btn ${filterType === 'battery' ? 'active' : ''}`}
              onClick={() => setFilterType('battery')}
            >
              🔋 Batería
            </button>
            <button
              className={`filter-btn ${filterType === 'connection' ? 'active' : ''}`}
              onClick={() => setFilterType('connection')}
            >
              🔌 Conexión
            </button>
            <button
              className={`filter-btn ${filterType === 'system' ? 'active' : ''}`}
              onClick={() => setFilterType('system')}
            >
              ⚙️ Sistema
            </button>
          </div>
        </div>

        <div className="sort-group">
          <label>Ordenar:</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-select">
            <option value="newest">Más Recientes</option>
            <option value="oldest">Más Antiguas</option>
          </select>
        </div>
      </div>

      <div className="alerts-list">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`alert-item alert-${alert.severity} ${alert.read ? 'read' : 'unread'}`}
              style={{ borderLeftColor: getSeverityColor(alert.severity) }}
            >
              <div className="alert-icon">
                {getAlertIcon(alert.type)}
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <h3>{alert.title}</h3>
                  <span className="alert-time">{alert.timestamp}</span>
                </div>
                <p className="alert-message">{alert.message}</p>
              </div>
              <div className="alert-actions">
                {!alert.read && (
                  <button
                    className="alert-btn"
                    onClick={() => handleMarkAsRead(alert.id)}
                    title="Marcar como leído"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="alert-btn delete"
                  onClick={() => handleDeleteAlert(alert.id)}
                  title="Eliminar alerta"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <p>No hay alertas</p>
            <small>Cuando haya nuevas alertas, aparecerán aquí</small>
          </div>
        )}
      </div>

      <div className="alerts-stats">
        <div className="stat">
          <span className="stat-label">Total de Alertas</span>
          <span className="stat-value">{alerts.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">No Leídas</span>
          <span className="stat-value alert-color">{unreadCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Leídas</span>
          <span className="stat-value">{alerts.length - unreadCount}</span>
        </div>
      </div>
    </div>
  );
};

export default AlertsCenter;
