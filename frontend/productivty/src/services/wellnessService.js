import { wellnessAPI, apiUtils } from './api';

class WellnessService {
  // Get wellness reminders
  async getReminders() {
    try {
      const response = await wellnessAPI.getReminders();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Update wellness reminders
  async updateReminders(reminders) {
    try {
      const response = await wellnessAPI.updateReminders(reminders);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get wellness statistics
  async getWellnessStats() {
    try {
      const response = await wellnessAPI.getWellnessStats();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Log a break
  async logBreak(breakData) {
    try {
      const response = await wellnessAPI.logBreak(breakData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get break history
  async getBreakHistory(params = {}) {
    try {
      const response = await wellnessAPI.getBreakHistory(params);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Update eye rest settings
  async updateEyeRestSettings(settings) {
    try {
      const response = await wellnessAPI.updateEyeRestSettings(settings);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Update posture settings
  async updatePostureSettings(settings) {
    try {
      const response = await wellnessAPI.updatePostureSettings(settings);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get wellness tips
  async getWellnessTips() {
    try {
      const response = await wellnessAPI.getWellnessTips();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Calculate wellness score
  calculateWellnessScore(reminders, breakHistory) {
    let score = 0;
    let factors = 0;

    // Eye rest compliance (20%)
    if (reminders.eyeRest?.enabled) {
      const todayBreaks = this.getTodayBreaks(breakHistory, 'eyeRest');
      const expectedBreaks = Math.floor(8 * 60 / reminders.eyeRest.interval); // 8 hours
      const compliance = Math.min((todayBreaks / expectedBreaks) * 100, 100);
      score += compliance * 0.2;
    }
    factors++;

    // Posture compliance (20%)
    if (reminders.posture?.enabled) {
      const todayPosture = this.getTodayBreaks(breakHistory, 'posture');
      const expectedPosture = Math.floor(8 * 60 / reminders.posture.interval);
      const compliance = Math.min((todayPosture / expectedPosture) * 100, 100);
      score += compliance * 0.2;
    }
    factors++;

    // Break compliance (30%)
    if (reminders.break?.enabled) {
      const todayBreaks = this.getTodayBreaks(breakHistory, 'break');
      const expectedBreaks = Math.floor(8 * 60 / reminders.break.interval);
      const compliance = Math.min((todayBreaks / expectedBreaks) * 100, 100);
      score += compliance * 0.3;
    }
    factors++;

    // Overall wellness (30%)
    const totalBreaks = this.getTodayBreaks(breakHistory);
    const wellnessFactor = Math.min((totalBreaks / 10) * 100, 100); // Target 10 breaks per day
    score += wellnessFactor * 0.3;
    factors++;

    return Math.round(score);
  }

  // Get today's breaks by type
  getTodayBreaks(breakHistory, type = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return breakHistory.filter(break_ => {
      const breakDate = new Date(break_.createdAt);
      const isToday = breakDate >= today;
      return isToday && (!type || break_.type === type);
    }).length;
  }

  // Get breaks by date range
  getBreaksByDateRange(breakHistory, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return breakHistory.filter(break_ => {
      const breakDate = new Date(break_.createdAt);
      return breakDate >= start && breakDate <= end;
    });
  }

  // Get break compliance rate
  getBreakComplianceRate(reminders, breakHistory, period = 'today') {
    let filteredBreaks;
    
    switch (period) {
      case 'today':
        filteredBreaks = this.getTodayBreaks(breakHistory);
        break;
      case 'week':
        filteredBreaks = this.getWeekBreaks(breakHistory);
        break;
      case 'month':
        filteredBreaks = this.getMonthBreaks(breakHistory);
        break;
      default:
        filteredBreaks = breakHistory;
    }
    
    const totalExpected = Object.values(reminders).reduce((total, reminder) => {
      if (!reminder.enabled) return total;
      return total + reminder.interval;
    }, 0);
    
    return totalExpected > 0 ? Math.round((filteredBreaks.length / totalExpected) * 100) : 0;
  }

  // Get this week's breaks
  getWeekBreaks(breakHistory) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    return breakHistory.filter(break_ => {
      const breakDate = new Date(break_.createdAt);
      return breakDate >= weekStart;
    });
  }

  // Get this month's breaks
  getMonthBreaks(breakHistory) {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return breakHistory.filter(break_ => {
      const breakDate = new Date(break_.createdAt);
      return breakDate >= monthStart;
    });
  }

  // Get wellness recommendations
  getWellnessRecommendations(reminders, breakHistory) {
    const recommendations = [];
    
    // Eye rest recommendations
    if (!reminders.eyeRest?.enabled) {
      recommendations.push({
        type: 'eyeRest',
        message: 'Enable eye rest reminders to follow the 20-20-20 rule and reduce eye strain',
        priority: 'high'
      });
    } else {
      const todayEyeRest = this.getTodayBreaks(breakHistory, 'eyeRest');
      if (todayEyeRest < 4) {
        recommendations.push({
          type: 'eyeRest',
          message: 'You\'ve taken few eye rest breaks today. Try to follow the 20-20-20 rule more consistently',
          priority: 'medium'
        });
      }
    }
    
    // Posture recommendations
    if (!reminders.posture?.enabled) {
      recommendations.push({
        type: 'posture',
        message: 'Enable posture reminders to maintain healthy sitting habits throughout the day',
        priority: 'high'
      });
    } else {
      const todayPosture = this.getTodayBreaks(breakHistory, 'posture');
      if (todayPosture < 6) {
        recommendations.push({
          type: 'posture',
          message: 'Consider taking more posture breaks to avoid back and neck strain',
          priority: 'medium'
        });
      }
    }
    
    // Break recommendations
    if (!reminders.break?.enabled) {
      recommendations.push({
        type: 'break',
        message: 'Enable regular break reminders to maintain productivity and prevent burnout',
        priority: 'high'
      });
    } else {
      const todayBreaks = this.getTodayBreaks(breakHistory, 'break');
      if (todayBreaks < 3) {
        recommendations.push({
          type: 'break',
          message: 'You haven\'t taken many breaks today. Regular breaks improve focus and well-being',
          priority: 'medium'
        });
      }
    }
    
    return recommendations;
  }

  // Validate reminder settings
  validateReminderSettings(reminders) {
    const errors = {};
    
    // Validate eye rest settings
    if (reminders.eyeRest?.enabled) {
      if (!reminders.eyeRest.interval || reminders.eyeRest.interval < 5 || reminders.eyeRest.interval > 60) {
        errors.eyeRestInterval = 'Eye rest interval must be between 5 and 60 minutes';
      }
      if (!reminders.eyeRest.duration || reminders.eyeRest.duration < 10 || reminders.eyeRest.duration > 60) {
        errors.eyeRestDuration = 'Eye rest duration must be between 10 and 60 seconds';
      }
    }
    
    // Validate posture settings
    if (reminders.posture?.enabled) {
      if (!reminders.posture.interval || reminders.posture.interval < 15 || reminders.posture.interval > 120) {
        errors.postureInterval = 'Posture interval must be between 15 and 120 minutes';
      }
      if (!reminders.posture.duration || reminders.posture.duration < 10 || reminders.posture.duration > 30) {
        errors.postureDuration = 'Posture duration must be between 10 and 30 seconds';
      }
    }
    
    // Validate break settings
    if (reminders.break?.enabled) {
      if (!reminders.break.interval || reminders.break.interval < 15 || reminders.break.interval > 180) {
        errors.breakInterval = 'Break interval must be between 15 and 180 minutes';
      }
      if (!reminders.break.duration || reminders.break.duration < 60 || reminders.break.duration > 600) {
        errors.breakDuration = 'Break duration must be between 1 and 10 minutes';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Generate wellness report
  generateWellnessReport(reminders, breakHistory, period = 'week') {
    let filteredBreaks;
    
    switch (period) {
      case 'today':
        filteredBreaks = this.getTodayBreaks(breakHistory);
        break;
      case 'week':
        filteredBreaks = this.getWeekBreaks(breakHistory);
        break;
      case 'month':
        filteredBreaks = this.getMonthBreaks(breakHistory);
        break;
      default:
        filteredBreaks = breakHistory;
    }
    
    const wellnessScore = this.calculateWellnessScore(reminders, filteredBreaks);
    const complianceRate = this.getBreakComplianceRate(reminders, filteredBreaks, period);
    const recommendations = this.getWellnessRecommendations(reminders, filteredBreaks);
    
    // Break down by type
    const eyeRestBreaks = filteredBreaks.filter(b => b.type === 'eyeRest').length;
    const postureBreaks = filteredBreaks.filter(b => b.type === 'posture').length;
    const regularBreaks = filteredBreaks.filter(b => b.type === 'break').length;
    
    return {
      period,
      wellnessScore,
      complianceRate,
      totalBreaks: filteredBreaks.length,
      eyeRestBreaks,
      postureBreaks,
      regularBreaks,
      recommendations,
      enabledReminders: Object.values(reminders).filter(r => r.enabled).length
    };
  }

  // Format break duration
  formatBreakDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }

  // Get next reminder time
  getNextReminderTime(reminder, lastTriggered) {
    if (!reminder.enabled || !lastTriggered) return null;
    
    const nextTime = new Date(lastTriggered);
    nextTime.setMinutes(nextTime.getMinutes() + reminder.interval);
    
    return nextTime;
  }
}

export const wellnessService = new WellnessService();
export default wellnessService;
