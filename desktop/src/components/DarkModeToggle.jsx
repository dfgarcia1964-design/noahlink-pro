import React, { useState, useEffect } from 'react';
import '../styles/DarkModeToggle.css';

const DarkModeToggle = ({ onToggle }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (onToggle) onToggle(isDark);
  }, [isDark, onToggle]);

  const handleToggle = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="dark-mode-toggle">
      <button
        className={`toggle-btn ${isDark ? 'dark' : 'light'}`}
        onClick={handleToggle}
        title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
        <span className="toggle-label">{isDark ? '🌙' : '☀️'}</span>
      </button>
      <span className="toggle-text">{isDark ? 'Oscuro' : 'Claro'}</span>
    </div>
  );
};

export default DarkModeToggle;
