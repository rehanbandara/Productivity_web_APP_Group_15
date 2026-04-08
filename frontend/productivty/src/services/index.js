// Export all services
export { default as api, authAPI, goalsAPI, timerAPI, wellnessAPI, settingsAPI, dashboardAPI, notificationsAPI, analyticsAPI, apiUtils } from './api';
export { default as goalsService } from './goalsService';
export { default as timerService } from './timerService';
export { default as wellnessService } from './wellnessService';
export { default as settingsService } from './settingsService';
export { default as dashboardService } from './dashboardService';
export { mockApi } from './mockApi';

// Service factory for easy access
class ServiceFactory {
  static getGoals() {
    return import('./goalsService').then(module => module.default);
  }
  
  static getTimer() {
    return import('./timerService').then(module => module.default);
  }
  
  static getWellness() {
    return import('./wellnessService').then(module => module.default);
  }
  
  static getSettings() {
    return import('./settingsService').then(module => module.default);
  }
  
  static getDashboard() {
    return import('./dashboardService').then(module => module.default);
  }
}

export default ServiceFactory;
