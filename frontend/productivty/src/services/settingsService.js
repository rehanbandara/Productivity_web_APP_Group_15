import { settingsAPI, apiUtils } from './api';

class SettingsService {
  // Get user settings
  async getUserSettings() {
    try {
      const response = await settingsAPI.getUserSettings();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Update user settings
  async updateSettings(settings) {
    try {
      const response = await settingsAPI.updateSettings(settings);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Reset settings to defaults
  async resetToDefaults() {
    try {
      const response = await settingsAPI.resetToDefaults();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Export user data
  async exportData() {
    try {
      const response = await settingsAPI.exportData();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Import user data
  async importData(data) {
    try {
      const response = await settingsAPI.importData(data);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const response = await settingsAPI.getNotificationSettings();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      const response = await settingsAPI.updateNotificationSettings(settings);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get focus settings
  async getFocusSettings() {
    try {
      const response = await settingsAPI.getFocusSettings();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Update focus settings
  async updateFocusSettings(settings) {
    try {
      const response = await settingsAPI.updateFocusSettings(settings);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get wellness settings
  async getWellnessSettings() {
    try {
      const response = await settingsAPI.getWellnessSettings();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Update wellness settings
  async updateWellnessSettings(settings) {
    try {
      const response = await settingsAPI.updateWellnessSettings(settings);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Default settings
  getDefaultSettings() {
    return {
      focus: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartWork: false,
        soundEnabled: true,
        volume: 0.5
      },
      wellness: {
        eyeRest: {
          enabled: true,
          interval: 20, // minutes
          duration: 20, // seconds
          soundEnabled: true
        },
        posture: {
          enabled: true,
          interval: 45, // minutes
          duration: 15, // seconds
          soundEnabled: true
        },
        break: {
          enabled: true,
          interval: 25, // minutes
          duration: 300, // seconds (5 minutes)
          soundEnabled: true
        }
      },
      notifications: {
        desktop: true,
        sound: true,
        email: false,
        push: false,
        reminderLeadTime: 5 // minutes
      },
      general: {
        theme: 'light',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      }
    };
  }

  // Validate settings
  validateSettings(settings) {
    const errors = {};
    
    // Validate focus settings
    if (settings.focus) {
      if (!settings.focus.workDuration || settings.focus.workDuration < 1 || settings.focus.workDuration > 60) {
        errors.focusWorkDuration = 'Work duration must be between 1 and 60 minutes';
      }
      
      if (!settings.focus.shortBreakDuration || settings.focus.shortBreakDuration < 1 || settings.focus.shortBreakDuration > 30) {
        errors.focusShortBreakDuration = 'Short break duration must be between 1 and 30 minutes';
      }
      
      if (!settings.focus.longBreakDuration || settings.focus.longBreakDuration < 1 || settings.focus.longBreakDuration > 60) {
        errors.focusLongBreakDuration = 'Long break duration must be between 1 and 60 minutes';
      }
      
      if (!settings.focus.sessionsUntilLongBreak || settings.focus.sessionsUntilLongBreak < 2 || settings.focus.sessionsUntilLongBreak > 10) {
        errors.focusSessionsUntilLongBreak = 'Sessions until long break must be between 2 and 10';
      }
      
      if (settings.focus.volume !== undefined && (settings.focus.volume < 0 || settings.focus.volume > 1)) {
        errors.focusVolume = 'Volume must be between 0 and 1';
      }
    }
    
    // Validate wellness settings
    if (settings.wellness) {
      if (settings.wellness.eyeRest?.enabled) {
        if (!settings.wellness.eyeRest.interval || settings.wellness.eyeRest.interval < 5 || settings.wellness.eyeRest.interval > 60) {
          errors.eyeRestInterval = 'Eye rest interval must be between 5 and 60 minutes';
        }
        
        if (!settings.wellness.eyeRest.duration || settings.wellness.eyeRest.duration < 10 || settings.wellness.eyeRest.duration > 60) {
          errors.eyeRestDuration = 'Eye rest duration must be between 10 and 60 seconds';
        }
      }
      
      if (settings.wellness.posture?.enabled) {
        if (!settings.wellness.posture.interval || settings.wellness.posture.interval < 15 || settings.wellness.posture.interval > 120) {
          errors.postureInterval = 'Posture interval must be between 15 and 120 minutes';
        }
        
        if (!settings.wellness.posture.duration || settings.wellness.posture.duration < 10 || settings.wellness.posture.duration > 30) {
          errors.postureDuration = 'Posture duration must be between 10 and 30 seconds';
        }
      }
      
      if (settings.wellness.break?.enabled) {
        if (!settings.wellness.break.interval || settings.wellness.break.interval < 15 || settings.wellness.break.interval > 180) {
          errors.breakInterval = 'Break interval must be between 15 and 180 minutes';
        }
        
        if (!settings.wellness.break.duration || settings.wellness.break.duration < 60 || settings.wellness.break.duration > 600) {
          errors.breakDuration = 'Break duration must be between 1 and 10 minutes';
        }
      }
    }
    
    // Validate notification settings
    if (settings.notifications) {
      if (settings.notifications.reminderLeadTime !== undefined && 
          (settings.notifications.reminderLeadTime < 0 || settings.notifications.reminderLeadTime > 60)) {
        errors.reminderLeadTime = 'Reminder lead time must be between 0 and 60 minutes';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Merge settings with defaults
  mergeWithDefaults(userSettings) {
    const defaults = this.getDefaultSettings();
    
    return {
      focus: { ...defaults.focus, ...userSettings.focus },
      wellness: {
        eyeRest: { ...defaults.wellness.eyeRest, ...userSettings.wellness?.eyeRest },
        posture: { ...defaults.wellness.posture, ...userSettings.wellness?.posture },
        break: { ...defaults.wellness.break, ...userSettings.wellness?.break }
      },
      notifications: { ...defaults.notifications, ...userSettings.notifications },
      general: { ...defaults.general, ...userSettings.general }
    };
  }

  // Export settings to JSON
  exportSettingsToJSON(settings) {
    return JSON.stringify(settings, null, 2);
  }

  // Import settings from JSON
  importSettingsFromJSON(jsonString) {
    try {
      const settings = JSON.parse(jsonString);
      const validation = this.validateSettings(settings);
      
      if (!validation.isValid) {
        throw new Error('Invalid settings format: ' + Object.values(validation.errors).join(', '));
      }
      
      return this.mergeWithDefaults(settings);
    } catch (error) {
      throw new Error('Failed to import settings: ' + error.message);
    }
  }

  // Get settings summary
  getSettingsSummary(settings) {
    return {
      focusEnabled: settings.focus.workDuration > 0,
      wellnessEnabled: Object.values(settings.wellness).some(w => w.enabled),
      notificationsEnabled: settings.notifications.desktop || settings.notifications.sound,
      totalReminders: Object.values(settings.wellness).filter(w => w.enabled).length,
      dailyFocusGoal: settings.focus.workDuration * 4, // 4 sessions per day
      wellnessScore: this.calculateWellnessScore(settings.wellness)
    };
  }

  // Calculate wellness score based on settings
  calculateWellnessScore(wellnessSettings) {
    let score = 0;
    let total = 0;
    
    if (wellnessSettings.eyeRest.enabled) {
      score += wellnessSettings.eyeRest.interval <= 20 ? 33 : 15;
      total += 33;
    }
    
    if (wellnessSettings.posture.enabled) {
      score += wellnessSettings.posture.interval <= 45 ? 33 : 15;
      total += 33;
    }
    
    if (wellnessSettings.break.enabled) {
      score += wellnessSettings.break.interval <= 30 ? 34 : 20;
      total += 34;
    }
    
    return total > 0 ? Math.round((score / total) * 100) : 0;
  }

  // Get recommended settings based on usage patterns
  getRecommendedSettings(usageData) {
    const recommendations = this.getDefaultSettings();
    
    // Adjust based on average session length
    if (usageData.averageSessionLength > 30) {
      recommendations.focus.workDuration = 30;
      recommendations.focus.shortBreakDuration = 10;
    } else if (usageData.averageSessionLength < 20) {
      recommendations.focus.workDuration = 20;
      recommendations.focus.shortBreakDuration = 5;
    }
    
    // Adjust wellness reminders based on compliance
    if (usageData.eyeRestCompliance < 50) {
      recommendations.wellness.eyeRest.interval = 15; // More frequent
    }
    
    if (usageData.postureCompliance < 50) {
      recommendations.wellness.posture.interval = 30; // More frequent
    }
    
    return recommendations;
  }
}

export const settingsService = new SettingsService();
export default settingsService;
