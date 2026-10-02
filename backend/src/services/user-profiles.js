/**
 * User Profiles Service
 * Manages user profiles with saved settings and presets
 */

const fs = require('fs');
const path = require('path');

class UserProfilesManager {
  constructor() {
    this.DATA_DIR = path.join(__dirname, '../../data');
    this.PROFILES_FILE = path.join(this.DATA_DIR, 'user-profiles.json');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.DATA_DIR)) {
      fs.mkdirSync(this.DATA_DIR, { recursive: true });
    }
  }

  /**
   * Create a new user profile
   */
  createProfile(deviceId, profileData) {
    if (!profileData.name) {
      throw new Error('Profile name is required');
    }

    const profile = {
      id: this.generateProfileId(),
      deviceId,
      name: profileData.name,
      description: profileData.description || '',
      icon: profileData.icon || '👤',
      settings: profileData.settings || {},
      presets: profileData.presets || {},
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: profileData.metadata || {}
    };

    try {
      const profiles = this.getAllProfiles(deviceId);
      profiles.push(profile);
      this.saveProfiles(deviceId, profiles);
      return profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  /**
   * Get all profiles for a device
   */
  getAllProfiles(deviceId) {
    try {
      const allProfiles = this.loadAllProfiles();
      return allProfiles.filter(p => p.deviceId === deviceId);
    } catch (error) {
      console.error('Error getting profiles:', error);
      return [];
    }
  }

  /**
   * Get a specific profile
   */
  getProfile(deviceId, profileId) {
    const profiles = this.getAllProfiles(deviceId);
    return profiles.find(p => p.id === profileId) || null;
  }

  /**
   * Get active profile
   */
  getActiveProfile(deviceId) {
    const profiles = this.getAllProfiles(deviceId);
    return profiles.find(p => p.isActive) || profiles[0] || null;
  }

  /**
   * Update profile
   */
  updateProfile(deviceId, profileId, updates) {
    try {
      const profiles = this.getAllProfiles(deviceId);
      const index = profiles.findIndex(p => p.id === profileId);

      if (index === -1) {
        throw new Error('Profile not found');
      }

      const profile = profiles[index];
      const allowedFields = ['name', 'description', 'icon', 'settings', 'presets', 'metadata'];

      allowedFields.forEach(field => {
        if (updates.hasOwnProperty(field)) {
          if (field === 'settings' || field === 'presets' || field === 'metadata') {
            // Merge objects instead of replacing
            profile[field] = { ...profile[field], ...updates[field] };
          } else {
            profile[field] = updates[field];
          }
        }
      });

      profile.updatedAt = new Date().toISOString();
      this.saveProfiles(deviceId, profiles);
      return profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Delete profile
   */
  deleteProfile(deviceId, profileId) {
    try {
      const profiles = this.getAllProfiles(deviceId);
      const filtered = profiles.filter(p => p.id !== profileId);

      if (filtered.length === profiles.length) {
        throw new Error('Profile not found');
      }

      // If deleted profile was active, make first one active
      if (profiles.find(p => p.id === profileId)?.isActive && filtered.length > 0) {
        filtered[0].isActive = true;
      }

      this.saveProfiles(deviceId, filtered);
      return { success: true, deletedId: profileId };
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }

  /**
   * Activate a profile
   */
  activateProfile(deviceId, profileId) {
    try {
      const profiles = this.getAllProfiles(deviceId);

      // Deactivate all
      profiles.forEach(p => p.isActive = false);

      // Activate target
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      profile.isActive = true;
      this.saveProfiles(deviceId, profiles);
      return profile;
    } catch (error) {
      console.error('Error activating profile:', error);
      throw error;
    }
  }

  /**
   * Save preset in profile
   */
  savePreset(deviceId, profileId, presetName, presetData) {
    try {
      const profile = this.getProfile(deviceId, profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      profile.presets[presetName] = {
        ...presetData,
        savedAt: new Date().toISOString()
      };

      const profiles = this.getAllProfiles(deviceId);
      const index = profiles.findIndex(p => p.id === profileId);
      profiles[index] = profile;
      this.saveProfiles(deviceId, profiles);

      return profile.presets[presetName];
    } catch (error) {
      console.error('Error saving preset:', error);
      throw error;
    }
  }

  /**
   * Delete preset from profile
   */
  deletePreset(deviceId, profileId, presetName) {
    try {
      const profile = this.getProfile(deviceId, profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      delete profile.presets[presetName];

      const profiles = this.getAllProfiles(deviceId);
      const index = profiles.findIndex(p => p.id === profileId);
      profiles[index] = profile;
      this.saveProfiles(deviceId, profiles);

      return { success: true, deletedPreset: presetName };
    } catch (error) {
      console.error('Error deleting preset:', error);
      throw error;
    }
  }

  /**
   * Export profile as JSON
   */
  exportProfile(deviceId, profileId) {
    const profile = this.getProfile(deviceId, profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    return {
      version: '1.0',
      profile: {
        name: profile.name,
        description: profile.description,
        icon: profile.icon,
        settings: profile.settings,
        presets: profile.presets,
        metadata: profile.metadata
      },
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import profile from JSON
   */
  importProfile(deviceId, importData) {
    if (!importData.profile || !importData.profile.name) {
      throw new Error('Invalid profile data');
    }

    return this.createProfile(deviceId, {
      name: `${importData.profile.name} (Importado)`,
      description: importData.profile.description || '',
      icon: importData.profile.icon || '👤',
      settings: importData.profile.settings || {},
      presets: importData.profile.presets || {},
      metadata: { ...importData.profile.metadata, importedAt: new Date().toISOString() }
    });
  }

  /**
   * Get profile statistics
   */
  getProfileStats(profileId) {
    return {
      profileId,
      presetsCount: Object.keys(profileId.presets || {}).length,
      settingsCount: Object.keys(profileId.settings || {}).length
    };
  }

  /**
   * Private: Load all profiles from file
   */
  loadAllProfiles() {
    try {
      if (!fs.existsSync(this.PROFILES_FILE)) {
        return [];
      }

      const data = fs.readFileSync(this.PROFILES_FILE, 'utf-8');
      return JSON.parse(data) || [];
    } catch (error) {
      console.error('Error loading profiles:', error);
      return [];
    }
  }

  /**
   * Private: Save profiles to file
   */
  saveProfiles(deviceId, profiles) {
    try {
      const allProfiles = this.loadAllProfiles();

      // Remove old profiles for this device
      const otherProfiles = allProfiles.filter(p => p.deviceId !== deviceId);

      // Combine with new profiles
      const combined = [...otherProfiles, ...profiles];

      fs.writeFileSync(this.PROFILES_FILE, JSON.stringify(combined, null, 2));
    } catch (error) {
      console.error('Error saving profiles:', error);
      throw error;
    }
  }

  /**
   * Private: Generate unique profile ID
   */
  generateProfileId() {
    return `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new UserProfilesManager();
