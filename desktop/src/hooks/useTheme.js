import { useState, useEffect, useCallback } from 'react';

const useTheme = () => {
  const [theme, setTheme] = useState('dark');
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedContrast = localStorage.getItem('highContrast') === 'true';
    setTheme(savedTheme);
    setHighContrast(savedContrast);
    applyTheme(savedTheme, savedContrast);
  }, []);

  const applyTheme = (newTheme, contrast = highContrast) => {
    const root = document.documentElement;

    if (newTheme === 'dark') {
      root.style.backgroundColor = '#0f172a';
      root.style.color = '#f1f5f9';
    } else {
      root.style.backgroundColor = '#ffffff';
      root.style.color = '#1e293b';
    }

    if (contrast) {
      root.style.setProperty('--contrast', 'high');
    } else {
      root.style.setProperty('--contrast', 'normal');
    }
  };

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme, highContrast);
  }, [theme, highContrast]);

  const toggleHighContrast = useCallback(() => {
    const newContrast = !highContrast;
    setHighContrast(newContrast);
    localStorage.setItem('highContrast', newContrast);
    applyTheme(theme, newContrast);
  }, [theme, highContrast]);

  return {
    theme,
    highContrast,
    toggleTheme,
    toggleHighContrast
  };
};

export default useTheme;
