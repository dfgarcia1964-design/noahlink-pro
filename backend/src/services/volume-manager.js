/**
 * Volume Manager Service
 * Manages volume settings for hearing aids with persistence
 */

const volumeStates = new Map();

class VolumeManager {
  constructor() {
    this.maxVolume = 100;
    this.minVolume = 0;
    this.defaultVolume = 75;
    this.volumeStep = 5; // Volume changes in 5% increments
  }

  /**
   * Initialize device volume
   */
  initializeDevice(deviceId, initialVolume = this.defaultVolume) {
    if (!volumeStates.has(deviceId)) {
      volumeStates.set(deviceId, {
        deviceId,
        volume: initialVolume,
        lastUpdated: new Date(),
        muted: false,
        previousVolume: initialVolume
      });
      console.log(`🔊 Initialized volume for ${deviceId}: ${initialVolume}%`);
    }
    return volumeStates.get(deviceId);
  }

  /**
   * Get current volume
   */
  getVolume(deviceId) {
    const state = volumeStates.get(deviceId);
    if (!state) {
      return this.initializeDevice(deviceId);
    }
    return state;
  }

  /**
   * Set volume
   */
  setVolume(deviceId, volume) {
    // Validate volume
    if (volume < this.minVolume || volume > this.maxVolume) {
      throw new Error(`Volume must be between ${this.minVolume} and ${this.maxVolume}`);
    }

    const state = this.initializeDevice(deviceId);
    const oldVolume = state.volume;
    
    state.previousVolume = oldVolume;
    state.volume = volume;
    state.lastUpdated = new Date();
    state.muted = volume === 0;

    console.log(`🔊 Set ${deviceId} volume: ${oldVolume}% → ${volume}%`);

    return {
      success: true,
      deviceId,
      previousVolume: oldVolume,
      currentVolume: volume,
      timestamp: state.lastUpdated
    };
  }

  /**
   * Increase volume
   */
  increaseVolume(deviceId) {
    const state = this.getVolume(deviceId);
    const newVolume = Math.min(state.volume + this.volumeStep, this.maxVolume);
    return this.setVolume(deviceId, newVolume);
  }

  /**
   * Decrease volume
   */
  decreaseVolume(deviceId) {
    const state = this.getVolume(deviceId);
    const newVolume = Math.max(state.volume - this.volumeStep, this.minVolume);
    return this.setVolume(deviceId, newVolume);
  }

  /**
   * Mute device
   */
  mute(deviceId) {
    const state = this.getVolume(deviceId);
    state.previousVolume = state.volume;
    state.volume = 0;
    state.muted = true;
    state.lastUpdated = new Date();

    console.log(`🔇 Muted ${deviceId}`);

    return {
      success: true,
      deviceId,
      muted: true,
      volume: 0
    };
  }

  /**
   * Unmute device (restore previous volume)
   */
  unmute(deviceId) {
    const state = this.getVolume(deviceId);
    const previousVolume = state.previousVolume || this.defaultVolume;
    
    return this.setVolume(deviceId, previousVolume);
  }

  /**
   * Get all device volumes
   */
  getAllVolumes() {
    const volumes = [];
    for (const [deviceId, state] of volumeStates) {
      volumes.push({
        deviceId,
        volume: state.volume,
        muted: state.muted,
        lastUpdated: state.lastUpdated
      });
    }
    return volumes;
  }

  /**
   * Reset volume to default
   */
  resetVolume(deviceId) {
    return this.setVolume(deviceId, this.defaultVolume);
  }

  /**
   * Get volume percentage bar
   */
  getVolumeBar(deviceId, length = 20) {
    const state = this.getVolume(deviceId);
    const filledLength = Math.round((state.volume / this.maxVolume) * length);
    const emptyLength = length - filledLength;
    
    const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);
    return `[${bar}] ${state.volume}%`;
  }

  /**
   * Get volume level description
   */
  getVolumeDescription(deviceId) {
    const state = this.getVolume(deviceId);
    const { volume } = state;

    if (volume === 0) return 'Silencio';
    if (volume < 20) return 'Muy bajo';
    if (volume < 40) return 'Bajo';
    if (volume < 60) return 'Medio';
    if (volume < 80) return 'Alto';
    return 'Muy alto';
  }
}

module.exports = new VolumeManager();
