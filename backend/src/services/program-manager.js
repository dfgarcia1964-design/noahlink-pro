/**
 * Program Manager Service
 * Manages hearing aid programs and program switching
 */

class ProgramManager {
  constructor() {
    this.programs = {
      speech: {
        id: 'speech',
        name: 'Conversación',
        icon: '👥',
        description: 'Optimizado para conversación en ambientes normales',
        category: 'standard',
        frequency: [100, 500, 1000, 2000, 4000, 8000],
        gain: [5, 8, 10, 12, 15, 18],
        active: true
      },
      noise: {
        id: 'noise',
        name: 'Ruido',
        icon: '🔊',
        description: 'Reduce ruido de fondo',
        category: 'standard',
        frequency: [100, 500, 1000, 2000, 4000, 8000],
        gain: [2, 3, 5, 8, 12, 15],
        active: false
      },
      music: {
        id: 'music',
        name: 'Música',
        icon: '🎵',
        description: 'Mejor reproducción de música',
        category: 'entertainment',
        frequency: [100, 500, 1000, 2000, 4000, 8000],
        gain: [8, 10, 12, 15, 18, 20],
        active: false
      },
      outdoor: {
        id: 'outdoor',
        name: 'Aire Libre',
        icon: '🌳',
        description: 'Para ambientes al aire libre',
        category: 'environmental',
        frequency: [100, 500, 1000, 2000, 4000, 8000],
        gain: [10, 12, 15, 18, 20, 22],
        active: false
      },
      telecoil: {
        id: 'telecoil',
        name: 'Bobina Telefónica',
        icon: '📞',
        description: 'Para dispositivos compatible con bobina',
        category: 'special',
        frequency: [500, 1000, 2000, 4000],
        gain: [15, 18, 20, 22],
        active: false
      }
    };

    // Track active program per device
    this.activePrograms = {};
  }

  /**
   * Get all available programs
   */
  getAllPrograms() {
    return Object.values(this.programs);
  }

  /**
   * Get program by ID
   */
  getProgram(programId) {
    return this.programs[programId] || null;
  }

  /**
   * Get current active program for device
   */
  getActiveProgram(deviceId) {
    const activeId = this.activePrograms[deviceId] || 'speech';
    return this.getProgram(activeId);
  }

  /**
   * Switch to a program
   */
  switchProgram(deviceId, programId) {
    if (!this.programs[programId]) {
      throw new Error(`Program not found: ${programId}`);
    }

    // Update active program
    this.activePrograms[deviceId] = programId;

    // Log the action
    this.logProgramChange(deviceId, programId);

    return {
      success: true,
      deviceId,
      previousProgram: this.activePrograms[deviceId],
      newProgram: programId,
      programData: this.getProgram(programId),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get programs by category
   */
  getProgramsByCategory(category) {
    return Object.values(this.programs).filter(p => p.category === category);
  }

  /**
   * Get frequency response for program
   */
  getFrequencyResponse(programId) {
    const program = this.getProgram(programId);
    if (!program) return null;

    return {
      programId,
      frequencies: program.frequency,
      gainValues: program.gain
    };
  }

  /**
   * Estimate program effectiveness
   */
  getProgramStats(programId) {
    const program = this.getProgram(programId);
    if (!program) return null;

    const avgGain = Math.round(
      program.gain.reduce((a, b) => a + b) / program.gain.length
    );
    const maxGain = Math.max(...program.gain);
    const minGain = Math.min(...program.gain);

    return {
      programId,
      name: program.name,
      averageGain: avgGain,
      maxGain,
      minGain,
      frequencies: program.frequency.length,
      category: program.category
    };
  }

  /**
   * Log program change
   */
  logProgramChange(deviceId, programId) {
    try {
      const fs = require('fs');
      const path = require('path');

      const logFile = path.join(__dirname, '../../data/program-changes.json');
      let logs = [];

      if (fs.existsSync(logFile)) {
        const data = fs.readFileSync(logFile, 'utf-8');
        logs = JSON.parse(data);
      }

      logs.push({
        deviceId,
        programId,
        programName: this.programs[programId]?.name,
        timestamp: new Date().toISOString()
      });

      // Keep last 100 changes
      logs = logs.slice(-100);

      fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Error logging program change:', error);
    }
  }

  /**
   * Get program change history
   */
  getProgramHistory(deviceId = null, limit = 20) {
    try {
      const fs = require('fs');
      const path = require('path');

      const logFile = path.join(__dirname, '../../data/program-changes.json');
      if (!fs.existsSync(logFile)) {
        return [];
      }

      const data = fs.readFileSync(logFile, 'utf-8');
      let logs = JSON.parse(data);

      if (deviceId) {
        logs = logs.filter(log => log.deviceId === deviceId);
      }

      return logs.slice(-limit).reverse();
    } catch (error) {
      console.error('Error reading program history:', error);
      return [];
    }
  }
}

module.exports = new ProgramManager();
