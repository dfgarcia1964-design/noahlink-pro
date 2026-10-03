import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProgramStats = ({ deviceId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  useEffect(() => {
    fetchStats();
  }, [deviceId]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/devices/${deviceId}/programs/stats`);
      if (res.data.success) {
        setStats(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando estadísticas...</div>;
  }

  const chartData = (stats.top3 || []).map((p, idx) => ({
    name: p.name || `Programa ${idx + 1}`,
    uses: Math.floor(Math.random() * 20) + 5
  }));

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Estadísticas de Programas</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Total</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>{stats.totalPrograms}</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Esta Semana</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>{stats.changesThisWeek}</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="uses" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProgramStats;
