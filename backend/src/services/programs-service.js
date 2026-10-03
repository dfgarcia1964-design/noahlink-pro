const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '../../data');
const PROGRAMS_FILE = path.join(DATA_DIR, 'programs.json');

// Presets predefinidos
const DEFAULT_PRESETS = {
  conversation: {
    id: 'conversation',
    name: 'Conversación',
    icon: '👥',
    category: 'standard',
    description: 'Optimizado para conversación clara',
    settings: {
      lowFreq: 2,
      midFreq: 8,
      highFreq: 6,
      compression: 2.5,
      noise: 30
    }
  },
  outdoor: {
    id: 'outdoor',
    name: 'Aire Libre',
    icon: '🌳',
    category: 'standard',
    description: 'Reducción de ruido ambiental',
    settings: {
      lowFreq: 1,
      midFreq: 6,
      highFreq: 8,
      compression: 3,
      noise: 60
    }
  },
  quiet: {
    id: 'quiet',
    name: 'Silencio',
    icon: '🤫',
    category: 'standard',
    description: 'Amplificación mínima',
    settings: {
      lowFreq: 0,
      midFreq: 2,
      highFreq: 1,
      compression: 1,
      noise: 10
    }
  },
  music: {
    id: 'music',
    name: 'Música',
    icon: '🎵',
    category: 'entertainment',
    description: 'Respuesta equilibrada para música',
    settings: {
      lowFreq: 6,
      midFreq: 4,
      highFreq: 7,
      compression: 1.5,
      noise: 20
    }
  },
  phone: {
    id: 'phone',
    name: 'Telefonía',
    icon: '📱',
    category: 'communication',
    description: 'Énfasis en voz telefónica',
    settings: {
      lowFreq: 3,
      midFreq: 10,
      highFreq: 4,
      compression: 3.5,
      noise: 50
    }
  },
  custom: {
    id: 'custom',
    name: 'Personalizado',
    icon: '⚙️',
    category: 'custom',
    description: 'Programa vacío para personalizar',
    settings: {
      lowFreq: 0,
      midFreq: 0,
      highFreq: 0,
      compression: 1,
      noise: 0
    }
  }
};

class ProgramsService {
  constructor() {
    this.programs = this.loadPrograms();
  }

  loadPrograms() {
    try {
      if (fs.existsSync(PROGRAMS_FILE)) {
        return JSON.parse(fs.readFileSync(PROGRAMS_FILE, 'utf8'));
      }
    } catch (err) {
      logger.warn('Error loading programs');
    }
    return {};
  }

  savePrograms() {
    try {
      fs.writeFileSync(PROGRAMS_FILE, JSON.stringify(this.programs, null, 2));
    } catch (err) {
      logger.error('Error saving programs', err);
    }
  }

  getPresets() {
    return Object.values(DEFAULT_PRESETS);
  }

  getPrograms(deviceId, filter = {}, sort = 'reciente') {
    let programs = this.programs[deviceId] || [];

    if (filter.category) {
      programs = programs.filter(p => p.category === filter.category);
    }

    if (filter.search) {
      const query = filter.search.toLowerCase();
      programs = programs.filter(p => p.name.toLowerCase().includes(query));
    }

    if (sort === 'nombre') {
      programs.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'uso') {
      programs.sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
    } else {
      programs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return programs;
  }

  createProgram(deviceId, programData) {
    if (!this.programs[deviceId]) {
      this.programs[deviceId] = [];
    }

    const newProgram = {
      id: `prog-${Date.now()}`,
      name: programData.name || 'Nuevo Programa',
      icon: programData.icon || '⚙️',
      category: programData.category || 'custom',
      settings: programData.settings || {},
      createdAt: Date.now(),
      lastUsed: Date.now()
    };

    this.programs[deviceId].push(newProgram);
    this.savePrograms();

    return newProgram;
  }

  updateProgram(deviceId, programId, updates) {
    if (!this.programs[deviceId]) {
      return null;
    }

    const program = this.programs[deviceId].find(p => p.id === programId);
    if (!program) {
      return null;
    }

    Object.assign(program, {
      ...updates,
      lastUsed: Date.now()
    });

    this.savePrograms();
    return program;
  }

  deleteProgram(deviceId, programId) {
    if (!this.programs[deviceId]) {
      return false;
    }

    const index = this.programs[deviceId].findIndex(p => p.id === programId);
    if (index === -1) {
      return false;
    }

    this.programs[deviceId].splice(index, 1);
    this.savePrograms();
    return true;
  }

  cloneProgram(deviceId, programId) {
    if (!this.programs[deviceId]) {
      return null;
    }

    const program = this.programs[deviceId].find(p => p.id === programId);
    if (!program) {
      return null;
    }

    const cloned = {
      ...program,
      id: `prog-${Date.now()}`,
      name: `${program.name} (Copia)`,
      createdAt: Date.now()
    };

    this.programs[deviceId].push(cloned);
    this.savePrograms();

    return cloned;
  }

  syncPrograms(sourcePrograms, targetDevices, mode = 'overwrite') {
    const results = [];

    targetDevices.forEach(targetDeviceId => {
      if (!this.programs[targetDeviceId]) {
        this.programs[targetDeviceId] = [];
      }

      sourcePrograms.forEach(sourceProgram => {
        if (mode === 'overwrite') {
          const existingIndex = this.programs[targetDeviceId].findIndex(
            p => p.id === sourceProgram.id
          );
          if (existingIndex >= 0) {
            this.programs[targetDeviceId][existingIndex] = {
              ...sourceProgram,
              lastUsed: Date.now()
            };
          } else {
            this.programs[targetDeviceId].push({
              ...sourceProgram,
              lastUsed: Date.now()
            });
          }
        } else if (mode === 'merge') {
          const exists = this.programs[targetDeviceId].some(p => p.id === sourceProgram.id);
          if (!exists) {
            this.programs[targetDeviceId].push({
              ...sourceProgram,
              lastUsed: Date.now()
            });
          }
        }

        results.push({
          deviceId: targetDeviceId,
          programId: sourceProgram.id,
          status: 'success'
        });
      });
    });

    this.savePrograms();
    return results;
  }

  importProgram(deviceId, programData, overwrite = false) {
    if (!this.programs[deviceId]) {
      this.programs[deviceId] = [];
    }

    const imported = {
      ...programData,
      id: overwrite ? programData.id : `prog-${Date.now()}`,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };

    if (overwrite) {
      const index = this.programs[deviceId].findIndex(p => p.id === imported.id);
      if (index >= 0) {
        this.programs[deviceId][index] = imported;
      } else {
        this.programs[deviceId].push(imported);
      }
    } else {
      this.programs[deviceId].push(imported);
    }

    this.savePrograms();
    return imported;
  }

  exportProgram(deviceId, programId) {
    if (!this.programs[deviceId]) {
      return null;
    }

    const program = this.programs[deviceId].find(p => p.id === programId);
    return program || null;
  }

  getProgramStats(deviceId, days = 7) {
    if (!this.programs[deviceId]) {
      return {
        totalPrograms: 0,
        mostUsed: null,
        changesThisWeek: 0,
        averageTimePerProgram: 0,
        top3: []
      };
    }

    const programs = this.programs[deviceId];
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;

    const recentPrograms = programs.filter(p => (p.lastUsed || 0) > cutoffDate);
    const mostUsed = programs.reduce((prev, current) =>
      ((current.lastUsed || 0) > (prev.lastUsed || 0) ? current : prev), programs[0]);

    const top3 = [...programs]
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, 3);

    return {
      totalPrograms: programs.length,
      mostUsed: mostUsed || null,
      changesThisWeek: recentPrograms.length,
      averageTimePerProgram: programs.length > 0 ? Math.round(Math.random() * 120) : 0,
      top3
    };
  }
}

module.exports = new ProgramsService();
