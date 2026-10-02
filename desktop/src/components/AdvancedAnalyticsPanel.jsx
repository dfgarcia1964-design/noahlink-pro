import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdvancedAnalytics.css';

const AdvancedAnalytics = ({ deviceId = 'sky-l-90-up-left' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [health, setHealth] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [deviceId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [summaryRes, insightsRes, recommendationsRes, healthRes] = await Promise.all([
        axios.get(`/api/v1/devices/${deviceId}/analytics/summary`),
        axios.get(`/api/v1/devices/${deviceId}/analytics/insights`),
        axios.get(`/api/v1/devices/${deviceId}/analytics/recommendations`),
        axios.get(`/api/v1/devices/${deviceId}/analytics/health`)
      ]);

      setAnalytics(summaryRes.data.stats);
      setInsights(insightsRes.data.insights || []);
      setRecommendations(recommendationsRes.data.recommendations || []);
      setHealth(healthRes.data.health);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('No se pudieron cargar los análisis');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getHealthLabel = (score) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Crítico';
  };

  return (
    <div className="advanced-analytics">
      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="close">✕</button>
        </div>
      )}

      <div className="analytics-tabs">
        <button
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          📊 Resumen
        </button>
        <button
          className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          💡 Insights
        </button>
        <button
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          🎯 Recomendaciones
        </button>
        <button
          className={`tab ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          ❤️ Salud
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando análisis...</div>
      ) : (
        <>
          {activeTab === 'summary' && analytics && (
            <div className="tab-content summary">
              <div className="stat-cards">
                <div className="stat-card">
                  <label>📊 Total de Eventos</label>
                  <span className="value">{analytics.totalEvents}</span>
                </div>
                <div className="stat-card">
                  <label>🔋 Batería Actual</label>
                  <span className="value">{analytics.batteryStats.current}%</span>
                </div>
                <div className="stat-card">
                  <label>⚡ Drenaje/Hora</label>
                  <span className="value">{analytics.batteryStats.drainRate}%/h</span>
                </div>
                <div className="stat-card">
                  <label>📈 Promedio (24h)</label>
                  <span className="value">{analytics.batteryStats.average}%</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="tab-content insights">
              <div className="insights-grid">
                {insights.length > 0 ? (
                  insights.map((insight, idx) => (
                    <div key={idx} className="insight-card">
                      <span className="icon">{insight.icon}</span>
                      <div className="content">
                        <h4>{insight.type.replace(/_/g, ' ')}</h4>
                        <p>{insight.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty">No hay insights</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="tab-content recommendations">
              {recommendations.length > 0 ? (
                <div className="recommendations-list">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className={`recommendation-item priority-${rec.priority}`}>
                      <div className="icon">{rec.icon}</div>
                      <div className="content">
                        <h4>{rec.title}</h4>
                        <p>{rec.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">✓ Sin recomendaciones</div>
              )}
            </div>
          )}

          {activeTab === 'health' && health && (
            <div className="tab-content health">
              <div className="health-score">
                <div className="circle" style={{ color: getHealthColor(health.overall) }}>
                  <div className="number">{health.overall}</div>
                  <div className="label">{getHealthLabel(health.overall)}</div>
                </div>
              </div>
              <div className="health-details">
                <div className="item">
                  <label>🔋 Batería</label>
                  <span>{health.battery.current}% - {health.battery.health}</span>
                </div>
                <div className="item">
                  <label>⚠️ Errores</label>
                  <span>{health.errors}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <button className="btn-refresh" onClick={fetchAnalytics} disabled={loading}>
        🔄 Actualizar
      </button>
    </div>
  );
};

export default AdvancedAnalytics;
