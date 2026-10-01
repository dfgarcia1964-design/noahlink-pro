import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/BatteryChart.css';

const BatteryChart = ({ data }) => {
  // Preparar datos para el gráfico
  const chartData = data.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    bateria: item.level,
    timestamp: item.timestamp
  }));

  return (
    <div className="battery-chart">
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              interval={Math.floor(chartData.length / 8)}
            />
            <YAxis
              domain={[0, 100]}
              label={{ value: 'Porcentaje (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Batería']}
              labelStyle={{ color: '#000' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="bateria"
              stroke="#8884d8"
              dot={false}
              strokeWidth={2}
              name="Nivel de Batería"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-info">
        <div className="info-card">
          <h4>📊 Análisis</h4>
          <ul>
            <li>Nivel actual: <strong>{data[data.length - 1]?.level || 0}%</strong></li>
            <li>Mínimo (24h): <strong>{Math.min(...data.map(d => d.level))}%</strong></li>
            <li>Máximo (24h): <strong>{Math.max(...data.map(d => d.level))}%</strong></li>
            <li>Drenaje promedio: <strong>~3-4% por hora</strong></li>
          </ul>
        </div>

        <div className="info-card">
          <h4>⚠️ Alertas</h4>
          {data[data.length - 1]?.level < 25 ? (
            <div className="alert critical">
              🔴 Batería crítica: Carga pronto
            </div>
          ) : data[data.length - 1]?.level < 50 ? (
            <div className="alert warning">
              🟡 Batería baja: Considera cargar
            </div>
          ) : (
            <div className="alert good">
              🟢 Batería en buen nivel
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatteryChart;
