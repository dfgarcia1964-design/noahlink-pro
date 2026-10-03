import { useState, useCallback } from 'react';
import axios from 'axios';

const useProgramEditor = (initialProgram = null) => {
  const [program, setProgram] = useState(initialProgram || {
    id: null,
    name: 'Nuevo Programa',
    icon: '⚙️',
    category: 'custom',
    settings: {
      lowFreq: 0,
      midFreq: 0,
      highFreq: 0,
      compression: 1,
      noise: 0
    }
  });

  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  const updateName = useCallback((newName) => {
    setProgram(prev => ({ ...prev, name: newName }));
    setIsDirty(true);
  }, []);

  const updateIcon = useCallback((newIcon) => {
    setProgram(prev => ({ ...prev, icon: newIcon }));
    setIsDirty(true);
  }, []);

  const updateSetting = useCallback((settingName, value) => {
    setProgram(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [settingName]: parseFloat(value)
      }
    }));
    setIsDirty(true);
  }, []);

  const save = useCallback(async (deviceId) => {
    if (!deviceId) {
      setError('Device ID required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      if (program.id) {
        // Update existing
        response = await axios.put(
          `${API_BASE}/devices/${deviceId}/programs/${program.id}`,
          {
            name: program.name,
            icon: program.icon,
            category: program.category,
            settings: program.settings
          }
        );
      } else {
        // Create new
        response = await axios.post(
          `${API_BASE}/devices/${deviceId}/programs`,
          {
            name: program.name,
            icon: program.icon,
            category: program.category,
            settings: program.settings
          }
        );
      }

      if (response.data.success) {
        setProgram(response.data.data);
        setIsDirty(false);
        setLoading(false);
        return response.data.data;
      }
    } catch (err) {
      console.error('Error saving program:', err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
      return null;
    }
  }, [program, API_BASE]);

  const cancel = useCallback(() => {
    if (initialProgram) {
      setProgram(initialProgram);
    }
    setIsDirty(false);
  }, [initialProgram]);

  const reset = useCallback(() => {
    setProgram({
      id: null,
      name: 'Nuevo Programa',
      icon: '⚙️',
      category: 'custom',
      settings: {
        lowFreq: 0,
        midFreq: 0,
        highFreq: 0,
        compression: 1,
        noise: 0
      }
    });
    setIsDirty(false);
  }, []);

  return {
    program,
    isDirty,
    loading,
    error,
    updateName,
    updateIcon,
    updateSetting,
    save,
    cancel,
    reset
  };
};

export default useProgramEditor;
