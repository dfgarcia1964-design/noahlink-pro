import React, { useState } from 'react';
import '../styles/Settings.css';

const Settings = ({ onDarkModeChange }) => {
  const [settings, setSettings] = useState({
    darkMode: false,
    autoConnect: true,
    notifications: true,
    soundAlerts: true,
    batteryThreshold: 20,
    autoBackup: true,
    dataCollection: false,
    vibration: true,
    displayLanguage: 'es',
    updateFrequency: 30
  });

  const handleToggle = (key) => {
    const newValue = !settings[key];
    setSettings({ ...settings, [key]: newValue });
    if (key === 'darkMode') {
      onDarkModeChange(newValue);
    }
  };

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleReset = () => {
    if (window.confirm('¿Restablecer todos los ajustes a los valores por defecto?')) {
      setSettings({
        darkMode: false,
        autoConnect: true,
        notifications: true,
        soundAlerts: true,
        batteryThreshold: 20,
        autoBackup: true,
        dataCollection: false,
        vibration: true,
        displayLanguage: 'es',
        updateFrequency: 30
      });
    }
  };

  return (
    <div className="settings-container">
      <h2>⚙️ Configuración Avanzada</h2>

      {/* Conexión */}
      <div className="settings-section">
        <h3>🔌 Conexión</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span className="label-text">Conexión Automática</span>
            <span className="label-description">Conectar automáticamente al dispositivo</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.autoConnect}
              onChange={() => handleToggle('autoConnect')}
            />
            <span className="toggle"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span className="label-text">Frecuencia de Actualización</span>
            <span className="label-description">Segundos entre actualizaciones</span>
          </div>
          <div className="setting-control">
            <input
              type="range"
              min="10"
              max="120"
              step="10"
              value={settings.updateFrequency}
              onChange={(e) => handleChange('updateFrequency', parseInt(e.target.value))}
              className="slider"
            />
            <span className="value-display">{settings.updateFrequency}s</span>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="settings-section">
        <h3>🔔 Notificaciones</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span className="label-text">Notificaciones Habilitadas</span>
            <span className="label-description">Recibir alertas del dispositivo</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={() => handleToggle('notifications')}
            />
            <span className="toggle"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span className="label-text">Alertas de Sonido</span>
            <span className="label-description">Reproducir sonidos de notificación</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.soundAlerts}
              disabled={!settings.notifications}
              onChange={() => handleToggle('soundAlerts')}
            />
            <span className="toggle"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span className="label-text">Vibración</span>
            <span className="label-description">Feedback haptic en notificaciones</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.vibration}
              disabled={!settings.notifications}
              onChange={() => handleToggle('vibration')}
            />
            <span className="toggle"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span className="label-text">Umbral de Batería Baja</span>
            <span className="label-description">Alertar cuando batería sea menor a:</span>
          </div>
          <div className="setting-control">
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={settings.batteryThreshold}
              onChange={(e) => handleChange('batteryThreshold', parseInt(e.target.value))}
              className="slider"
            />
            <span className="value-display">{settings.batteryThreshold}%</span>
          </div>
        </div>
      </div>

      {/* Datos */}
      <div className="settings-section">
        <h3>💾 Datos & Privacidad</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span className="label-text">Copia de Seguridad Automática</span>
            <span className="label-description">Respaldar configuración diariamente</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.autoBackup}
              onChange={() => handleToggle('autoBackup')}
            />
            <span className="toggle"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span className="label-text">Recolección de Datos</span>
            <span className="label-description">Enviar datos de uso para mejorar la app</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.dataCollection}
              onChange={() => handleToggle('dataCollection')}
            />
            <span className="toggle"></span>
          </label>
        </div>
      </div>

      {/* Interfaz */}
      <div className="settings-section">
        <h3>🎨 Interfaz</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span className="label-text">Modo Oscuro</span>
            <span className="label-description">Tema oscuro para reducir fatiga visual</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
            />
            <span className="toggle"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span className="label-text">Idioma</span>
            <span className="label-description">Selecciona el idioma de la aplicación</span>
          </div>
          <select
            value={settings.displayLanguage}
            onChange={(e) => handleChange('displayLanguage', e.target.value)}
            className="select-input"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="settings-actions">
        <button className="btn primary" onClick={() => alert('✓ Configuración guardada')}>
          💾 Guardar Cambios
        </button>
        <button className="btn secondary" onClick={handleReset}>
          🔄 Restablecer Defectos
        </button>
      </div>

      <div className="settings-info">
        <p>ℹ️ Los cambios se guardan automáticamente en tu perfil</p>
      </div>
    </div>
  );
};

export default Settings;
