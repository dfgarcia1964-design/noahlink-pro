import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import '../styles/BatteryChart.css';

const BatteryPrediction = ({ data }) => {
  // Calculate prediction and trends
  const predictionData = useMemo(() => {
    if (data.length < 2) return { historical: [], prediction: [] };

    const sorted = [...data].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Calculate drain rate
    const firstTime = new Date(sorted[0].timestamp).getTime();
    const lastTime = new Date(sorted[sorted.length - 1].timestamp).getTime();
    const hoursDiff = (lastTime - firstTime) / (1000 * 60 * 60);
    const drainRate = hoursDiff > 0
      ? (sorted[0].level - sorted[sorted.length - 1].level) / hoursDiff
      : 0;

    // Format historical data
    const historical = sorted.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      actual: item.level,
      timestamp: item.timestamp,
      isPredicted: false
    }));

    // Generate prediction for next 24 hours
    const prediction = [];
    const currentBattery = sorted[sorted.length - 1].level;
    const baseTime = new Date(sorted[sorted.length - 1].timestamp).getTime();

    for (let i = 1; i <= 24; i++) {
      const futureTime = new Date(baseTime + i * 60 * 60 * 1000);
      const predictedLevel = Math.max(
        0,
        currentBattery - drainRate * i
      );

      prediction.push({
        time: futureTime.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        predicted: Math.round(predictedLevel),
        timestamp: futureTime.toISOString(),
        isPredicted: true
      });
    }

    // Combine for display (show last 6h of historical + next 18h of prediction)
    const combinedData = [
      ...historical.slice(-6),
      ...prediction.slice(0, 18)
    ];

    return { historical, prediction, combinedData, drainRate };
  }, [data]);

  const timeUntilDead = useMemo(() => {
    if (predictionData.prediction.length === 0) return null;
    const lastPredicted = predictionData.prediction[predictionData.prediction.length - 1];
    if (lastPredicted.predicted <= 0) {
      const emptyPoint = predictionData.prediction.find(p => p.predicted <= 0);
      return emptyPoint ? `~${predictionData.prediction.indexOf(emptyPoint)}h` : '< 24h';
    }
    return '> 24h';
  }, [predictionData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isHistorical = data.actual !== undefined;
      return (
        <div className="custom-tooltip">
          <p className="time">{data.time}</p>
          {isHistorical ? (
            <p style={{ color: '#3b82f6' }}>📊 Actual: {data.actual}%</p>
          ) : (
            <p style={{ color: '#8b5cf6' }}>🔮 Predicción: {data.predicted}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return <div className="battery-chart empty">No hay datos para predicción</div>;
  }

  return (
    <div className="battery-chart">
      <div className="chart-container">
        <h3>Predicción de Batería (24h)</h3>
        <p className="chart-subtitle">
          📈 Basada en drenaje actual: {predictionData.drainRate?.toFixed(2)}%/hora
          | ⏱️ Tiempo hasta vacío: {timeUntilDead}
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={predictionData.combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11 }}
              interval={Math.max(0, Math.floor(predictionData.combinedData.length / 8))}
            />
            <YAxis domain={[0, 100]} label={{ value: '% Batería', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#000" />
            <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="5 5" label="Crítico" />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 5" label="Bajo" />

            {/* Historical data line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Batería Actual"
              connectNulls
              isAnimationActive={true}
            />

            {/* Prediction line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Predicción"
              connectNulls
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Prediction Cards */}
      <div className="chart-info">
        <div className="info-card">
          <h4>🔮 Análisis de Predicción</h4>
          <ul>
            <li>
              <span>Drenaje Actual:</span>
              <strong>{predictionData.drainRate?.toFixed(2)}%/hora</strong>
            </li>
            <li>
              <span>Batería en 6h:</span>
              <strong>{predictionData.prediction[6]?.predicted || 0}%</strong>
            </li>
            <li>
              <span>Batería en 12h:</span>
              <strong>{predictionData.prediction[12]?.predicted || 0}%</strong>
            </li>
            <li>
              <span>Batería en 18h:</span>
              <strong>{predictionData.prediction[18]?.predicted || 0}%</strong>
            </li>
            <li>
              <span>Hasta vacío:</span>
              <strong>{timeUntilDead}</strong>
            </li>
          </ul>
        </div>

        <div className="info-card">
          <h4>💡 Recomendaciones</h4>
          <div className="recommendations">
            {predictionData.drainRate > 5 && (
              <p>⚠️ Drenaje rápido detectado. Reduce uso o volumen.</p>
            )}
            {predictionData.drainRate <= 2 && (
              <p>✅ Drenaje normal. Batería en buen estado.</p>
            )}
            {predictionData.prediction[6]?.predicted < 25 && (
              <p>🔴 Carga recomendada en las próximas 6 horas</p>
            )}
            {predictionData.prediction[12]?.predicted <= 0 && (
              <p>🔌 Carga necesaria antes de {predictionData.prediction.find(p => p.predicted <= 0)?.time}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryPrediction;
