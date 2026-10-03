import React, { useState } from 'react';
import axios from 'axios';

const ReportsGenerator = ({ deviceId, deviceName = 'Device', userId = 'user-001' }) => {
  const [reportType, setReportType] = useState('summary');
  const [format, setFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  const reportTypes = [
    { id: 'summary', name: 'Resumen Semanal', icon: '📊', description: 'Estadísticas de la semana' },
    { id: 'detailed', name: 'Análisis Detallado', icon: '📈', description: 'Análisis profundo de 30 días' },
    { id: 'battery', name: 'Salud de Batería', icon: '🔋', description: 'Reporte de batería y drenaje' },
    { id: 'usage', name: 'Tendencias de Uso', icon: '📱', description: 'Patrones de uso y programas' },
    { id: 'comparison', name: 'Comparación', icon: '📊', description: 'Comparación con dispositivos' }
  ];

  const generateReport = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await axios.post(
        `${API_BASE}/devices/${deviceId}/analytics/export`,
        {
          format,
          type: reportType
        },
        {
          responseType: format === 'csv' ? 'blob' : 'json'
        }
      );

      if (format === 'csv') {
        downloadFile(response.data, `report-${deviceId}-${new Date().toISOString().split('T')[0]}.csv`);
        setMessage({ type: 'success', text: 'Reporte CSV descargado exitosamente' });
      } else if (format === 'pdf') {
        downloadFile(response.data, `report-${deviceId}-${new Date().toISOString().split('T')[0]}.pdf`);
        setMessage({ type: 'success', text: 'Reporte PDF descargado exitosamente' });
      } else {
        setMessage({ type: 'success', text: 'Reporte generado exitosamente' });
        console.log('Report:', response.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setMessage({ type: 'error', text: 'Error al generar el reporte' });
      setLoading(false);
    }
  };

  const downloadFile = (data, filename) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>Generador de Reportes</h2>
      <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#6b7280' }}>
        Dispositivo: <strong>{deviceName}</strong>
      </p>

      {/* Tipo de Reporte */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Seleccionar Tipo de Reporte</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setReportType(report.id)}
              style={{
                padding: '16px',
                backgroundColor: reportType === report.id ? '#2563eb' : '#ffffff',
                border: reportType === report.id ? '2px solid #2563eb' : '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (reportType !== report.id) {
                  e.target.style.borderColor = '#2563eb';
                }
              }}
              onMouseOut={(e) => {
                if (reportType !== report.id) {
                  e.target.style.borderColor = '#d1d5db';
                }
              }}
            >
              <div style={{
                fontSize: '24px',
                marginBottom: '8px'
              }}>
                {report.icon}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: reportType === report.id ? '#ffffff' : '#1f2937',
                marginBottom: '4px'
              }}>
                {report.name}
              </div>
              <div style={{
                fontSize: '10px',
                color: reportType === report.id ? '#e0e7ff' : '#6b7280'
              }}>
                {report.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Formato */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Seleccionar Formato</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['json', 'csv', 'pdf'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: format === fmt ? '#2563eb' : '#e5e7eb',
                color: format === fmt ? '#ffffff' : '#1f2937',
                textTransform: 'uppercase'
              }}
            >
              {fmt === 'json' ? '📄 JSON' : fmt === 'csv' ? '📊 CSV' : '📃 PDF'}
            </button>
          ))}
        </div>
      </div>

      {/* Opciones Avanzadas */}
      <div style={{
        padding: '12px',
        backgroundColor: '#f0f9ff',
        borderRadius: '6px',
        border: '1px solid #bfdbfe',
        marginBottom: '20px',
        fontSize: '12px',
        color: '#0369a1'
      }}>
        <strong>ℹ️ Información:</strong>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>JSON: Datos estructurados para análisis</li>
          <li>CSV: Compatible con Excel y hojas de cálculo</li>
          <li>PDF: Formato listo para imprimir y compartir</li>
        </ul>
      </div>

      {/* Mensajes */}
      {message && (
        <div style={{
          padding: '12px',
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`,
          borderRadius: '6px',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          marginBottom: '16px',
          fontSize: '12px'
        }}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Botón de Generar */}
      <button
        onClick={generateReport}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '700',
          backgroundColor: loading ? '#d1d5db' : '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          transition: 'all 0.2s',
          width: '100%'
        }}
        onMouseOver={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#1d4ed8';
          }
        }}
        onMouseOut={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#2563eb';
          }
        }}
      >
        {loading ? '⏳ Generando...' : '📥 Descargar Reporte'}
      </button>

      {/* Información Adicional */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#6b7280'
      }}>
        <strong>📌 Detalles del Reporte:</strong>
        <div style={{ marginTop: '8px' }}>
          Dispositivo: {deviceName} | Generado: {new Date().toLocaleString('es-ES')}
        </div>
        <div style={{ marginTop: '4px' }}>
          Incluye: Estadísticas, análisis de batería, anomalías y recomendaciones
        </div>
      </div>
    </div>
  );
};

export default ReportsGenerator;
