import React, { useState } from 'react';
import useProgramLibrary from '../hooks/useProgramLibrary';

const ProgramLibrary = ({ deviceId, onEditProgram, onApplyProgram }) => {
  const { programs, loading, search, deleteProgram, cloneProgram } = useProgramLibrary(deviceId);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = (query) => {
    setSearchQuery(query);
    search(query);
    setCurrentPage(1);
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(programs.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedPrograms = programs.slice(startIdx, startIdx + itemsPerPage);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando programas...</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Biblioteca de Programas</h2>

      <input
        type="text"
        placeholder="Buscar programa..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          marginBottom: '16px'
        }}
      />

      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Nombre</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Categoría</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPrograms.map((prog, idx) => (
              <tr key={prog.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px' }}>{prog.icon} {prog.name}</td>
                <td style={{ padding: '12px' }}>{prog.category}</td>
                <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button onClick={() => onEditProgram(prog)} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => onApplyProgram(prog)} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>✓</button>
                  <button onClick={() => cloneProgram(prog.id)} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>📋</button>
                  <button onClick={() => deleteProgram(prog.id)} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', color: '#ef4444' }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                backgroundColor: currentPage === page ? '#2563eb' : '#e5e7eb',
                color: currentPage === page ? '#ffffff' : '#1f2937',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: '12px', fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
        {programs.length} programas totales
      </div>
    </div>
  );
};

export default ProgramLibrary;
