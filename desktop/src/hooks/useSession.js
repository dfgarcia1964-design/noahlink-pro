import { useState, useEffect } from 'react';

const useSession = () => {
  const [session, setSession] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Inicializa sesión al cargar
  useEffect(() => {
    const storedSession = localStorage.getItem('noahlink_session');
    const storedFavorites = localStorage.getItem('noahlink_favorites');
    const storedDevice = localStorage.getItem('noahlink_selected_device');

    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      setSession(parsed);
    } else {
      createSession();
    }

    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    if (storedDevice) {
      setSelectedDevice(storedDevice);
    }
  }, []);

  // Guarda sesión cuando cambia
  useEffect(() => {
    if (session) {
      localStorage.setItem('noahlink_session', JSON.stringify(session));
    }
  }, [session]);

  // Guarda favoritos
  useEffect(() => {
    localStorage.setItem('noahlink_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Guarda dispositivo seleccionado
  useEffect(() => {
    if (selectedDevice) {
      localStorage.setItem('noahlink_selected_device', selectedDevice);
    }
  }, [selectedDevice]);

  const createSession = (username = 'usuario-' + Math.random().toString(36).substr(2, 9)) => {
    const newSession = {
      id: 'session-' + Date.now(),
      username: username,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      devices: [],
      settings: {
        theme: 'light',
        autoRefresh: true,
        refreshInterval: 5000
      }
    };
    setSession(newSession);
    return newSession;
  };

  const addFavorite = (deviceId) => {
    if (!favorites.includes(deviceId)) {
      setFavorites([...favorites, deviceId]);
    }
  };

  const removeFavorite = (deviceId) => {
    setFavorites(favorites.filter(id => id !== deviceId));
  };

  const updateSessionSettings = (newSettings) => {
    setSession({
      ...session,
      settings: { ...session?.settings, ...newSettings },
      lastActive: new Date().toISOString()
    });
  };

  const endSession = () => {
    localStorage.removeItem('noahlink_session');
    localStorage.removeItem('noahlink_favorites');
    localStorage.removeItem('noahlink_selected_device');
    setSession(null);
    setFavorites([]);
    setSelectedDevice(null);
  };

  return {
    session,
    favorites,
    selectedDevice,
    setSelectedDevice,
    createSession,
    addFavorite,
    removeFavorite,
    updateSessionSettings,
    endSession
  };
};

export default useSession;
