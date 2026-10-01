import React, { useState } from 'react';
import '../styles/AdvancedAnalytics.css';

const AdvancedAnalytics = ({ batteryHistory }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('battery');

  const metrics = [
    { id: 'battery', label: '🔋 Batería', color: '#667eea' },
    { id: 'usage', label: '⏱️ Uso', color: '#10b981' },
    { id: 'signal', label: '📶 Señal', color: '#f59e0b' },
  ];

  const generateAnalytics = () => {
    const current = batteryHistory[batteryHistory.length - 1]?.level || 85;
    const min = Math.min(...batteryHistory.map(h => h.level));
    const max = Math.max(...batteryHistory.map(h => h.level));
    const avg = Math.round(batteryHistory.reduce((a, h) => a + h.level, 0) / batteryHistory.length);
    const trend = ((current - batteryHistory[0]?.level) / batteryHistory[0]?.level * 100).toFixed(1);

    return { current, min, max, avg, trend };
  };

  const stats = generateAnalytics();

  return (
    <div className="advanced-analytics">
      <h2>📊 Análisis Avanzado</h2>

      {/* Time Range Selector */}
      <div className="time-selector">
        {['24h', '7d', '30d', '90d'].map(range => (
          <button
            key={range}
            className={`time-btn ${timeRange === range ? 'active' : ''}`}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <label>Nivel Actual</label>
          <div className="metric-value">{stats.current}%</div>
          <div className="metric-status excellent">Excelente</div>
        </div>
        <div className="metric-card">
          <label>Promedio ({timeRange})</label>
          <div className="metric-value">{stats.avg}%</div>
          <div className="metric-trend">Estable</div>
        </div>
        <div className="metric-card">
          <label>Mínimo</label>
          <div className="metric-value">{stats.min}%</div>
          <div className="metric-detail">Hoy</div>
        </div>
        <div className="metric-card">
          <label>Máximo</label>
          <div className="metric-value">{stats.max}%</div>
          <div className="metric-detail">Hoy</div>
        </div>
      </div>

      {/* Advanced Graphs */}
      <div className="graphs-container">
        <div className="graph-card">
          <h3>Distribución de Batería</h3>
          <div className="pie-chart">
            <svg viewBox="0 0 200 200">
              {/* Pie slices */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="#e5e7eb" strokeWidth="1" />

              {/* Excellent (>80%) */}
              <path
                d="M 100 20 A 80 80 0 0 1 163.27 43.27 L 122.45 32.45 A 60 60 0 0 0 100 40 Z"
                fill="#10b981"
                opacity="0.8"
              />

              {/* Good (50-80%) */}
              <path
                d="M 163.27 43.27 A 80 80 0 0 1 180 100 L 135 100 A 60 60 0 0 0 122.45 32.45 Z"
                fill="#f59e0b"
                opacity="0.8"
              />

              {/* Low (<50%) */}
              <path
                d="M 180 100 A 80 80 0 0 1 100 180 L 100 135 A 60 60 0 0 0 135 100 Z"
                fill="#ef4444"
                opacity="0.8"
              />

              {/* Center circle */}
              <circle cx="100" cy="100" r="40" fill="white" />
              <text x="100" y="105" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333">
                {stats.avg}%
              </text>
            </svg>
          </div>
          <div className="pie-legend">
            <div className="legend-item"><span className="dot excellent"></span> Excelente</div>
            <div className="legend-item"><span className="dot good"></span> Bueno</div>
            <div className="legend-item"><span className="dot low"></span> Bajo</div>
          </div>
        </div>

        <div className="graph-card">
          <h3>Predicción de Batería</h3>
          <div className="prediction-chart">
            <svg viewBox="0 0 300 150">
              {/* Grid */}
              <line x1="30" y1="10" x2="30" y2="130" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="30" y1="130" x2="290" y2="130" stroke="#e5e7eb" strokeWidth="1" />

              {/* Actual data curve */}
              <polyline
                points="30,100 80,90 130,80 180,70 230,65 280,60"
                fill="none"
                stroke="#667eea"
                strokeWidth="2"
              />

              {/* Prediction curve (dashed) */}
              <polyline
                points="230,65 280,45 320,30"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="5,5"
              />

              {/* Legend */}
              <text x="50" y="20" fontSize="11" fill="#667eea">Actual</text>
              <text x="150" y="20" fontSize="11" fill="#f59e0b">Predicción</text>
            </svg>
          </div>
          <p className="prediction-text">
            📈 Batería se agotará en ~8 horas (estimado a las 17:00)
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="insights-card">
        <h3>💡 Insights</h3>
        <ul>
          <li>✓ Tu uso promedio es <strong>3-4% por hora</strong></li>
          <li>✓ La batería se mantiene <strong>estable</strong> durante el día</li>
          <li>⚠️ Se recomienda cargar antes de las <strong>20:00</strong></li>
          <li>✓ Uso más eficiente <strong>en modo Conversación</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
