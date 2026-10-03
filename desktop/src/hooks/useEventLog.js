import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import useWebSocket from './useWebSocket';

/**
 * Hook para obtener y monitorear eventos de un dispositivo
 * Incluye filtrado, búsqueda y actualizaciones en tiempo real
 */
const useEventLog = (deviceId, userId = 'user-001') => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(null); // type, severity, search
  const [stats, setStats] = useState(null);

  const { on, connected } = useWebSocket();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  /**
   * Obtener eventos del servidor
   */
  const fetchEvents = useCallback(async () => {
    if (!deviceId) return;

    try {
      setLoading(true);
      setError(null);

      // URL base
      let url = `${API_BASE}/devices/${deviceId}/events`;

      // Agregar parámetros de filtro si existen
      const params = [];
      if (filter?.type) params.push(`type=${filter.type}`);
      if (filter?.severity) params.push(`severity=${filter.severity}`);
      if (filter?.search) url = `${API_BASE}/devices/${deviceId}/events/search?q=${filter.search}`;

      if (params.length > 0 && !filter?.search) {
        url += '?' + params.join('&');
      }

      const res = await axios.get(url);

      if (res.data.success) {
        const newEvents = res.data.events || res.data.data || [];
        setEvents(newEvents);
        setFilteredEvents(newEvents);
        console.log(`✅ Events loaded: ${newEvents.length} events`);
      }

      // Obtener estadísticas
      try {
        const statsRes = await axios.get(
          `${API_BASE}/devices/${deviceId}/events/stats`
        );
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
      } catch (err) {
        console.warn('Could not fetch event stats');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  }, [deviceId, filter, API_BASE]);

  // Cargar eventos al montar o cuando cambien las dependencias
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Escuchar nuevos eventos en tiempo real
  useEffect(() => {
    if (!connected) return;

    const unsubscribe = on('event:logged', (data) => {
      if (data.deviceId === deviceId) {
        console.log('📝 New event:', data.event);
        setEvents((prev) => [data.event, ...prev]);
        setFilteredEvents((prev) => [data.event, ...prev]);
      }
    });

    return unsubscribe;
  }, [deviceId, connected, on]);

  /**
   * Aplicar filtro por tipo
   */
  const filterByType = useCallback((type) => {
    setFilter({ ...filter, type });
  }, [filter]);

  /**
   * Aplicar filtro por severidad
   */
  const filterBySeverity = useCallback((severity) => {
    setFilter({ ...filter, severity });
  }, [filter]);

  /**
   * Buscar por texto
   */
  const search = useCallback((query) => {
    if (query) {
      setFilter({ ...filter, search: query });
    } else {
      setFilter({ ...filter, search: null });
    }
  }, [filter]);

  /**
   * Limpiar todos los filtros
   */
  const clearFilters = useCallback(() => {
    setFilter(null);
    setFilteredEvents(events);
  }, [events]);

  /**
   * Eliminar evento
   */
  const deleteEvent = useCallback(
    async (eventId) => {
      try {
        const res = await axios.delete(
          `${API_BASE}/devices/${deviceId}/events/${eventId}`
        );

        if (res.data.success) {
          setEvents((prev) => prev.filter((e) => e.id !== eventId));
          setFilteredEvents((prev) => prev.filter((e) => e.id !== eventId));
          console.log('✅ Event deleted');
        }
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('No se pudo eliminar el evento');
      }
    },
    [deviceId, API_BASE]
  );

  /**
   * Obtener eventos por tipo
   */
  const getEventsByType = useCallback(
    (type) => {
      return events.filter((e) => e.type === type);
    },
    [events]
  );

  /**
   * Obtener eventos por severidad
   */
  const getEventsBySeverity = useCallback(
    (severity) => {
      return events.filter((e) => e.severity === severity);
    },
    [events]
  );

  return {
    events: filteredEvents,
    allEvents: events,
    loading,
    error,
    filter,
    stats,
    filterByType,
    filterBySeverity,
    search,
    clearFilters,
    deleteEvent,
    getEventsByType,
    getEventsBySeverity,
    refresh: fetchEvents
  };
};

export default useEventLog;
