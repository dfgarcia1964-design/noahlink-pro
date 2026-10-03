import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const useProgramLibrary = (deviceId) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredPrograms, setFilteredPrograms] = useState([]);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  const fetchPrograms = useCallback(async () => {
    if (!deviceId) return;

    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/devices/${deviceId}/programs`);

      if (res.data.success) {
        setPrograms(res.data.data || []);
        setFilteredPrograms(res.data.data || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  }, [deviceId, API_BASE]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const search = useCallback((query) => {
    if (!query) {
      setFilteredPrograms(programs);
    } else {
      setFilteredPrograms(programs.filter(p => p.name.toLowerCase().includes(query.toLowerCase())));
    }
  }, [programs]);

  const filter = useCallback((category) => {
    if (!category) {
      setFilteredPrograms(programs);
    } else {
      setFilteredPrograms(programs.filter(p => p.category === category));
    }
  }, [programs]);

  const deleteProgram = useCallback(async (programId) => {
    try {
      const res = await axios.delete(`${API_BASE}/devices/${deviceId}/programs/${programId}`);

      if (res.data.success) {
        setPrograms(prev => prev.filter(p => p.id !== programId));
        setFilteredPrograms(prev => prev.filter(p => p.id !== programId));
      }
    } catch (err) {
      console.error('Error deleting program:', err);
      setError(err.response?.data?.error || err.message);
    }
  }, [deviceId, API_BASE]);

  const cloneProgram = useCallback(async (programId) => {
    try {
      const res = await axios.post(`${API_BASE}/devices/${deviceId}/programs/${programId}/clone`);

      if (res.data.success) {
        setPrograms(prev => [...prev, res.data.data]);
        setFilteredPrograms(prev => [...prev, res.data.data]);
      }
    } catch (err) {
      console.error('Error cloning program:', err);
      setError(err.response?.data?.error || err.message);
    }
  }, [deviceId, API_BASE]);

  const importProgram = useCallback(async (programData, overwrite = false) => {
    try {
      const res = await axios.post(`${API_BASE}/devices/${deviceId}/programs/import`, {
        programData,
        overwrite
      });

      if (res.data.success) {
        setPrograms(prev => [...prev, res.data.data]);
        setFilteredPrograms(prev => [...prev, res.data.data]);
      }
    } catch (err) {
      console.error('Error importing program:', err);
      setError(err.response?.data?.error || err.message);
    }
  }, [deviceId, API_BASE]);

  const exportProgram = useCallback((programId) => {
    const url = `${API_BASE}/devices/${deviceId}/programs/${programId}/export`;
    window.location.href = url;
  }, [deviceId, API_BASE]);

  return {
    programs: filteredPrograms,
    allPrograms: programs,
    loading,
    error,
    search,
    filter,
    deleteProgram,
    cloneProgram,
    importProgram,
    exportProgram,
    refresh: fetchPrograms
  };
};

export default useProgramLibrary;
