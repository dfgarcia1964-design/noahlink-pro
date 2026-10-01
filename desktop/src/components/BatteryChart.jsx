import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import '../styles/BatteryChart.css';

const BatteryChart = ({ data }) => {
  // Format data for charts
  const chartData = useMemo(() => {
    return data.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      bateria: item.level,
      timestamp: item.timestamp,
      date: new Date(item.timestamp)
    }));
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const levels = data.map(d => d.level);
    const current = levels[levels.length - 1];
    const min = Math.min(...levels);
    const max = Math.max(...levels);
    const avg = Math.round(levels.reduce((a, b) => a + b) / levels.length);

    // Calculate drain rate (% per hour)
    let drainRate = 0;
    if (data.length > 1) {
      const firstTime = new Date(data[0].timestamp).getTime();
      const lastTime = new Date(data[data.length - 1].timestamp).getTime();
      const hoursDiff = (lastTime - firstTime) / (1000 * 60 * 60);
      if (hoursDiff > 0) {
        drainRate = ((data[0].level - current) / hoursDiff).toFixed(2);
      }
    }

    // Predict when battery will die
    let timeUntilEmpty = 'N/A';
    if (drainRate > 0 && current > 0) {
      const hoursLeft = (current / drainRate).toFixed(1);
      timeUntilEmpty = hoursLeft > 24 ? '> 24h' : `${hoursLeft}h`;
    }

    return { current, min, max, avg, drainRate, timeUntilEmpty };
  }, [data]);

  // Battery status
  const getBatteryAlert = () => {
    if (!stats) return null;
    if (stats.current >= 75) {
      return { icon: '🟢', label: 'Excelente', color: '#22c55e' };
    } else if (stats.current >= 50) {
      return { icon: '🟢', label: 'Bueno', color: '#84cc16' };
    } else if (stats.current >= 25) {
      return { icon: '🟡', label: 'Bajo', color: '#f59e0b' };
    } else {
      return { icon: '🔴', label: 'Crítico', color: '#ef4444' };
    }
  };

  const alert = getBatteryAlert();

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="time">{data.time}</p>
          <p className="level" style={{ color: payload[0].color }}>
            🔋 {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return <div className="battery-chart empty">No hay datos disponibles</div>;
  }

  return (
    <div className="battery-chart">
      {/* Main Chart */}
      <div className="chart-container">
        <h3>Historial de Batería (24h)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorBateria" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11 }}
              interval={Math.max(0, Math.floor(chartData.length / 8))}
            />
            <YAxis
              domain={[0, 100]}
              label={{ value: '% Batería', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="5 5" label="Crítico (25%)" />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 5" label="Bajo (50%)" />
            <Area
              type="monotone"
              dataKey="bateria"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorBateria)"
              name="Nivel de Batería"
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Cards */}
      <div className="chart-info">
        <div className="info-card stats">
          <h4>📊 Estadísticas</h4>
          <div className="stat-grid">
            <div className="stat-item">
              <label>Actual</label>
              <span className="value">{stats?.current || 0}%</span>
            </div>
            <div className="stat-item">
              <label>Promedio</label>
              <span className="value">{stats?.avg || 0}%</span>
            </div>
            <div className="stat-item">
              <label>Mínimo (24h)</label>
              <span className="value">{stats?.min || 0}%</span>
            </div>
            <div className="stat-item">
              <label>Máximo (24h)</label>
              <span className="value">{stats?.max || 0}%</span>
            </div>
            <div className="stat-item">
              <label>Drenaje/hora</label>
              <span className="value">{stats?.drainRate || 0}%/h</span>
            </div>
            <div className="stat-item">
              <label>Tiempo hasta vacío</label>
              <span className="value">{stats?.timeUntilEmpty || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="info-card alert-card">
          <h4>⚠️ Estado</h4>
          <div className="alert" style={{ borderColor: alert?.color }}>
            <div className="alert-icon">{alert?.icon}</div>
            <div className="alert-content">
              <p className="alert-label">{alert?.label}</p>
              <p className="alert-message">
                {stats?.current >= 75
                  ? 'Batería en excelente estado'
                  : stats?.current >= 50
                  ? 'Batería en buen nivel, considera cargar pronto'
                  : stats?.current >= 25
                  ? '⚠️ Batería baja, carga recomendada'
                  : '🚨 Batería crítica, carga inmediatamente'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryChart;
