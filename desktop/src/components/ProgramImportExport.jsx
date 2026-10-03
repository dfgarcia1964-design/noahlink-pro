import React, { useRef, useState } from 'react';
import useProgramLibrary from '../hooks/useProgramLibrary';

const ProgramImportExport = ({ deviceId, programs }) => {
  const { exportProgram, importProgram } = useProgramLibrary(deviceId);
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState(null);

  const handleExportAll = () => {
    const data = JSON.stringify({ programs, version: '1.0' }, null, 2);
    downloadFile(data, `programs-backup-${new Date().toISOString().split('T')[0]}.json`);
    setMessage({ type: 'success', text: 'Programas exportados' });
  };

  const handleExportSelected = (program) => {
    const data = JSON.stringify(program, null, 2);
    downloadFile(data, `program-${program.id}.json`);
    setMessage({ type: 'success', text: `Programa ${program.name} exportado` });
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

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        if (data.programs && Array.isArray(data.programs)) {
          data.programs.forEach(prog => importProgram(prog, false));
          setMessage({ type: 'success', text: `${data.programs.length} programas importados` });
        } else if (data.id && data.settings) {
          importProgram(data, false);
          setMessage({ type: 'success', text: 'Programa importado' });
        } else {
          setMessage({ type: 'error', text: 'Formato de archivo inválido' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Error al leer archivo' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Importar/Exportar</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={handleExportAll}
          style={{
            padding: '12px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📥 Exportar Todo
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '12px',
            backgroundColor: '#22c55e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📤 Importar
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />

      {message && (
        <div style={{
          padding: '12px',
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`,
          borderRadius: '4px',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          fontSize: '12px',
          marginBottom: '12px'
        }}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {programs.length > 0 && (
        <div style={{
          padding: '12px',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600' }}>Programas Individuales</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {programs.slice(0, 5).map((prog) => (
              <button
                key={prog.id}
                onClick={() => handleExportSelected(prog)}
                style={{
                  padding: '6px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '3px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📄 {prog.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramImportExport;
