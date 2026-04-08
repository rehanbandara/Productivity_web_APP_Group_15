import { timerAPI, apiUtils } from './api';

class TimerService {
  // Get current timer session
  async getCurrentSession() {
    try {
      const response = await timerAPI.getCurrentSession();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Start new timer session
  async startSession(sessionData) {
    try {
      const response = await timerAPI.startSession(sessionData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Pause timer session
  async pauseSession(sessionId) {
    try {
      const response = await timerAPI.pauseSession(sessionId);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Resume timer session
  async resumeSession(sessionId) {
    try {
      const response = await timerAPI.resumeSession(sessionId);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Complete timer session
  async completeSession(sessionId) {
    try {
      const response = await timerAPI.completeSession(sessionId);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Reset timer session
  async resetSession(sessionId) {
    try {
      const response = await timerAPI.resetSession(sessionId);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get session history
  async getSessionHistory(params = {}) {
    try {
      const response = await timerAPI.getSessionHistory(params);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get today's statistics
  async getTodayStats() {
    try {
      const response = await timerAPI.getTodayStats();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get weekly statistics
  async getWeeklyStats() {
    try {
      const response = await timerAPI.getWeeklyStats();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get monthly statistics
  async getMonthlyStats() {
    try {
      const response = await timerAPI.getMonthlyStats();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Format time display
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Format focus time for display
  formatFocusTime(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  // Calculate session statistics
  calculateSessionStats(sessions) {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(session => session.status === 'completed').length;
    const totalFocusTime = sessions.reduce((total, session) => total + (session.duration || 0), 0);
    const averageSessionLength = completedSessions > 0 ? totalFocusTime / completedSessions : 0;
    
    return {
      totalSessions,
      completedSessions,
      totalFocusTime,
      averageSessionLength,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
    };
  }

  // Get sessions by date range
  getSessionsByDateRange(sessions, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.createdAt);
      return sessionDate >= start && sessionDate <= end;
    });
  }

  // Get sessions by type (work/break)
  getSessionsByType(sessions, type) {
    return sessions.filter(session => session.mode === type);
  }

  // Calculate productivity score
  calculateProductivityScore(sessions, targetMinutes = 240) {
    const todaySessions = this.getTodaySessions(sessions);
    const totalMinutes = todaySessions.reduce((total, session) => total + (session.duration || 0), 0);
    
    if (totalMinutes >= targetMinutes) return 100;
    return Math.round((totalMinutes / targetMinutes) * 100);
  }

  // Get today's sessions
  getTodaySessions(sessions) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.createdAt);
      return sessionDate >= today;
    });
  }

  // Get this week's sessions
  getWeekSessions(sessions) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.createdAt);
      return sessionDate >= weekStart;
    });
  }

  // Get this month's sessions
  getMonthSessions(sessions) {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.createdAt);
      return sessionDate >= monthStart;
    });
  }

  // Validate session data
  validateSession(sessionData) {
    const errors = {};
    
    if (!sessionData.mode || !['work', 'break'].includes(sessionData.mode)) {
      errors.mode = 'Valid mode (work or break) is required';
    }
    
    if (!sessionData.duration || sessionData.duration <= 0) {
      errors.duration = 'Valid duration is required';
    }
    
    if (sessionData.duration > 480) { // 8 hours max
      errors.duration = 'Duration cannot exceed 8 hours';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Generate session report
  generateSessionReport(sessions, period = 'week') {
    let filteredSessions;
    
    switch (period) {
      case 'today':
        filteredSessions = this.getTodaySessions(sessions);
        break;
      case 'week':
        filteredSessions = this.getWeekSessions(sessions);
        break;
      case 'month':
        filteredSessions = this.getMonthSessions(sessions);
        break;
      default:
        filteredSessions = sessions;
    }
    
    const stats = this.calculateSessionStats(filteredSessions);
    const workSessions = this.getSessionsByType(filteredSessions, 'work');
    const breakSessions = this.getSessionsByType(filteredSessions, 'break');
    
    return {
      period,
      ...stats,
      workSessions: workSessions.length,
      breakSessions: breakSessions.length,
      averageWorkSession: workSessions.length > 0 ? 
        workSessions.reduce((total, session) => total + (session.duration || 0), 0) / workSessions.length : 0,
      averageBreakSession: breakSessions.length > 0 ? 
        breakSessions.reduce((total, session) => total + (session.duration || 0), 0) / breakSessions.length : 0
    };
  }
}

export const timerService = new TimerService();
export default timerService;
