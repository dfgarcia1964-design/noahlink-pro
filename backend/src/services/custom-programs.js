/**
 * Custom Programs Service
 * Manages user-created custom hearing aid programs
 */

const fs = require('fs');
const path = require('path');

class CustomProgramsManager {
  constructor() {
    this.DATA_DIR = path.join(__dirname, '../../data');
    this.CUSTOM_PROGRAMS_FILE = path.join(this.DATA_DIR, 'custom-programs.json');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.DATA_DIR)) {
      fs.mkdirSync(this.DATA_DIR, { recursive: true });
    }
  }

  /**
   * Create a new custom program
   */
  createProgram(deviceId, programData) {
    if (!programData.name || !programData.frequency || !programData.gain) {
      throw new Error('Program must have name, frequency array, and gain array');
    }

    if (programData.frequency.length !== programData.gain.length) {
      throw new Error('Frequency and gain arrays must have same length');
    }

    const program = {
      id: this.generateProgramId(),
      deviceId,
      name: programData.name,
      description: programData.description || '',
      icon: programData.icon || '🎨',
      category: 'custom',
      frequency: programData.frequency,
      gain: programData.gain,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: false,
      metadata: programData.metadata || {}
    };

    try {
      const programs = this.getAllCustomPrograms(deviceId);
      programs.push(program);
      this.savePrograms(deviceId, programs);
      return program;
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  }

  /**
   * Get all custom programs for a device
   */
  getAllCustomPrograms(deviceId) {
    try {
      const allPrograms = this.loadAllPrograms();
      return allPrograms.filter(p => p.deviceId === deviceId && p.category === 'custom');
    } catch (error) {
      console.error('Error getting custom programs:', error);
      return [];
    }
  }

  /**
   * Get a specific custom program
   */
  getCustomProgram(deviceId, programId) {
    const programs = this.getAllCustomPrograms(deviceId);
    return programs.find(p => p.id === programId) || null;
  }

  /**
   * Update a custom program
   */
  updateProgram(deviceId, programId, updates) {
    try {
      const programs = this.getAllCustomPrograms(deviceId);
      const index = programs.findIndex(p => p.id === programId);

      if (index === -1) {
        throw new Error('Program not found');
      }

      // Update allowed fields
      const program = programs[index];
      const allowedFields = ['name', 'description', 'icon', 'frequency', 'gain', 'metadata'];

      allowedFields.forEach(field => {
        if (updates.hasOwnProperty(field)) {
          program[field] = updates[field];
        }
      });

      program.updatedAt = new Date().toISOString();

      this.savePrograms(deviceId, programs);
      return program;
    } catch (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  }

  /**
   * Delete a custom program
   */
  deleteProgram(deviceId, programId) {
    try {
      const programs = this.getAllCustomPrograms(deviceId);
      const filtered = programs.filter(p => p.id !== programId);

      if (filtered.length === programs.length) {
        throw new Error('Program not found');
      }

      this.savePrograms(deviceId, filtered);
      return { success: true, deletedId: programId };
    } catch (error) {
      console.error('Error deleting program:', error);
      throw error;
    }
  }

  /**
   * Duplicate an existing program (built-in or custom)
   */
  duplicateProgram(deviceId, sourceProgram, newName) {
    try {
      const newProgram = {
        id: this.generateProgramId(),
        deviceId,
        name: newName || `${sourceProgram.name} (Copy)`,
        description: sourceProgram.description || '',
        icon: sourceProgram.icon || '🎨',
        category: 'custom',
        frequency: [...sourceProgram.frequency],
        gain: [...sourceProgram.gain],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
        metadata: { sourceProgram: sourceProgram.id }
      };

      const programs = this.getAllCustomPrograms(deviceId);
      programs.push(newProgram);
      this.savePrograms(deviceId, programs);
      return newProgram;
    } catch (error) {
      console.error('Error duplicating program:', error);
      throw error;
    }
  }

  /**
   * Activate a custom program (set as active)
   */
  activateProgram(deviceId, programId) {
    try {
      const programs = this.getAllCustomPrograms(deviceId);

      // Deactivate all programs
      programs.forEach(p => p.isActive = false);

      // Activate target program
      const program = programs.find(p => p.id === programId);
      if (!program) {
        throw new Error('Program not found');
      }

      program.isActive = true;
      this.savePrograms(deviceId, programs);
      return program;
    } catch (error) {
      console.error('Error activating program:', error);
      throw error;
    }
  }

  /**
   * Get program statistics
   */
  getProgramStats(program) {
    const avgGain = Math.round(
      program.gain.reduce((a, b) => a + b) / program.gain.length
    );
    const maxGain = Math.max(...program.gain);
    const minGain = Math.min(...program.gain);

    return {
      programId: program.id,
      name: program.name,
      averageGain: avgGain,
      maxGain,
      minGain,
      frequencies: program.frequency.length,
      frequencyRange: `${Math.min(...program.frequency)}-${Math.max(...program.frequency)}Hz`
    };
  }

  /**
   * Validate program data
   */
  validateProgram(programData) {
    const errors = [];

    if (!programData.name || programData.name.trim() === '') {
      errors.push('Program name is required');
    }

    if (!Array.isArray(programData.frequency) || programData.frequency.length === 0) {
      errors.push('Frequency array is required');
    }

    if (!Array.isArray(programData.gain) || programData.gain.length === 0) {
      errors.push('Gain array is required');
    }

    if (programData.frequency?.length !== programData.gain?.length) {
      errors.push('Frequency and gain arrays must have the same length');
    }

    programData.gain?.forEach((g, i) => {
      if (typeof g !== 'number' || g < 0 || g > 25) {
        errors.push(`Gain at index ${i} must be between 0 and 25 dB`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Private: Load all programs from file
   */
  loadAllPrograms() {
    try {
      if (!fs.existsSync(this.CUSTOM_PROGRAMS_FILE)) {
        return [];
      }

      const data = fs.readFileSync(this.CUSTOM_PROGRAMS_FILE, 'utf-8');
      return JSON.parse(data) || [];
    } catch (error) {
      console.error('Error loading programs:', error);
      return [];
    }
  }

  /**
   * Private: Save programs to file
   */
  savePrograms(deviceId, programs) {
    try {
      const allPrograms = this.loadAllPrograms();

      // Remove old programs for this device
      const otherPrograms = allPrograms.filter(
        p => p.deviceId !== deviceId || p.category !== 'custom'
      );

      // Combine with new programs
      const combined = [...otherPrograms, ...programs];

      fs.writeFileSync(this.CUSTOM_PROGRAMS_FILE, JSON.stringify(combined, null, 2));
    } catch (error) {
      console.error('Error saving programs:', error);
      throw error;
    }
  }

  /**
   * Private: Generate unique program ID
   */
  generateProgramId() {
    return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new CustomProgramsManager();
