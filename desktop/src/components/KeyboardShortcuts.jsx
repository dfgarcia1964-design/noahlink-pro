import React, { useEffect, useState } from 'react';

const KeyboardShortcuts = ({ shortcuts = [] }) => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '?') {
        e.preventDefault();
        setShowHelp(!showHelp);
      }

      shortcuts.forEach(({ key, ctrl, shift, handler }) => {
        if ((ctrl === undefined || ctrl === (e.ctrlKey || e.metaKey)) &&
            (shift === undefined || shift === e.shiftKey) &&
            e.key === key) {
          e.preventDefault();
          handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts, showHelp]);

  return (
    <>
      {showHelp && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#1e293b',
          border: '2px solid #334155',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          zIndex: 10000,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#f1f5f9', fontSize: '18px', fontWeight: '700' }}>
            ⌨️ Atajos de Teclado
          </h2>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {shortcuts.map((shortcut, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: index < shortcuts.length - 1 ? '1px solid #334155' : 'none',
                fontSize: '13px'
              }}>
                <span style={{ color: '#cbd5e1' }}>{shortcut.description}</span>
                <kbd style={{
                  backgroundColor: '#0f172a',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: '#94a3b8',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>
                  {shortcut.display}
                </kbd>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowHelp(false)}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '10px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            Cerrar (ESC)
          </button>
        </div>
      )}

      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        Presiona Ctrl+? para ayuda
      </div>
    </>
  );
};

export default KeyboardShortcuts;
