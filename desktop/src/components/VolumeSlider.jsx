import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/VolumeSlider.css';

export function VolumeSlider({ deviceId = 'sky-l-90-up-left' }) {
  const [volume, setVolume] = useState(75);
  const [lastVolume, setLastVolume] = useState(75);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Get initial volume
  useEffect(() => {
    fetchVolume();
  }, []);

  const fetchVolume = async () => {
    try {
      const response = await axios.get(
        `/api/v1/devices/${deviceId}/volume`
      );
      if (response.data.success) {
        setVolume(response.data.volume);
        setLastVolume(response.data.volume);
        setIsMuted(response.data.volume === 0);
      }
    } catch (error) {
      console.error('Error fetching volume:', error);
    }
  };

  const handleVolumeChange = async (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setLastVolume(newVolume);
    setIsMuted(newVolume === 0);

    setLoading(true);
    try {
      const response = await axios.post(
        `/api/v1/devices/${deviceId}/volume`,
        { volume: newVolume }
      );
      if (response.data.success) {
        console.log(`🔊 Volume set to ${newVolume}%: ${response.data.description}`);
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMute = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/v1/devices/${deviceId}/volume`,
        { volume: 0 }
      );
      if (response.data.success) {
        setVolume(0);
        setIsMuted(true);
        console.log('🔇 Device muted');
      }
    } catch (error) {
      console.error('Error muting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnmute = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/v1/devices/${deviceId}/volume`,
        { volume: lastVolume }
      );
      if (response.data.success) {
        setVolume(lastVolume);
        setIsMuted(false);
        console.log(`🔊 Device unmuted - Volume: ${lastVolume}%`);
      }
    } catch (error) {
      console.error('Error unmuting:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return '🔇';
    if (volume < 30) return '🔈';
    if (volume < 70) return '🔉';
    return '🔊';
  };

  const getVolumeDescription = () => {
    if (volume === 0) return 'Silencio';
    if (volume < 20) return 'Muy bajo';
    if (volume < 40) return 'Bajo';
    if (volume < 60) return 'Medio';
    if (volume < 80) return 'Alto';
    return 'Muy alto';
  };

  return (
    <div className="volume-slider-container">
      <div className="volume-header">
        <span className="volume-icon">{getVolumeIcon()}</span>
        <h3>Control de Volumen</h3>
        <span className="volume-badge">{volume}%</span>
      </div>

      <div className="volume-control">
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          disabled={loading}
          className="volume-slider"
        />
        <div className="volume-display">
          <span className="volume-level">{getVolumeDescription()}</span>
        </div>
      </div>

      <div className="volume-visualizer">
        <div className="volume-bar-background">
          <div
            className="volume-bar-fill"
            style={{ width: `${volume}%` }}
          ></div>
        </div>
      </div>

      <div className="volume-buttons">
        {volume > 0 ? (
          <button 
            onClick={handleMute} 
            disabled={loading}
            className="btn-mute"
          >
            🔇 Silenciar
          </button>
        ) : (
          <button 
            onClick={handleUnmute} 
            disabled={loading}
            className="btn-unmute"
          >
            🔊 Dessilenciar
          </button>
        )}
      </div>

      <div className="volume-presets">
        <button
          onClick={() => handleVolumeChange({ target: { value: 25 } })}
          disabled={loading}
          className={`preset ${volume === 25 ? 'active' : ''}`}
        >
          25%
        </button>
        <button
          onClick={() => handleVolumeChange({ target: { value: 50 } })}
          disabled={loading}
          className={`preset ${volume === 50 ? 'active' : ''}`}
        >
          50%
        </button>
        <button
          onClick={() => handleVolumeChange({ target: { value: 75 } })}
          disabled={loading}
          className={`preset ${volume === 75 ? 'active' : ''}`}
        >
          75%
        </button>
        <button
          onClick={() => handleVolumeChange({ target: { value: 100 } })}
          disabled={loading}
          className={`preset ${volume === 100 ? 'active' : ''}`}
        >
          100%
        </button>
      </div>
    </div>
  );
}

export default VolumeSlider;
