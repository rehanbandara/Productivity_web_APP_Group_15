import { dashboardAPI, apiUtils } from './api';

class DashboardService {
  // Get dashboard overview
  async getDashboardOverview() {
    try {
      const response = await dashboardAPI.getOverview();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get productivity statistics
  async getProductivityStats(period = 'week') {
    try {
      const response = await dashboardAPI.getProductivityStats(period);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get recent activity
  async getRecentActivity() {
    try {
      const response = await dashboardAPI.getRecentActivity();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get upcoming goals
  async getUpcomingGoals() {
    try {
      const response = await dashboardAPI.getUpcomingGoals();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get wellness status
  async getWellnessStatus() {
    try {
      const response = await dashboardAPI.getWellnessStatus();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get today's focus time
  async getFocusTimeToday() {
    try {
      const response = await dashboardAPI.getFocusTimeToday();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get weekly progress
  async getWeeklyProgress() {
    try {
      const response = await dashboardAPI.getWeeklyProgress();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get monthly progress
  async getMonthlyProgress() {
    try {
      const response = await dashboardAPI.getMonthlyProgress();
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Calculate productivity metrics
  calculateProductivityMetrics(sessions, goals, wellnessData) {
    const today = new Date();
    const todaySessions = this.getTodaySessions(sessions);
    const todayGoals = this.getTodayGoals(goals);
    
    // Focus time metrics
    const totalFocusTime = todaySessions.reduce((total, session) => 
      total + (session.duration || 0), 0);
    const completedSessions = todaySessions.filter(session => 
      session.status === 'completed').length;
    const averageSessionLength = completedSessions > 0 ? 
      totalFocusTime / completedSessions : 0;
    
    // Goal metrics
    const completedGoals = todayGoals.filter(goal => goal.status === 'completed').length;
    const totalGoals = todayGoals.length;
    const goalProgress = this.calculateOverallGoalProgress(todayGoals);
    
    // Wellness metrics
    const wellnessScore = this.calculateWellnessScore(wellnessData);
    const breaksTaken = this.getTodayBreaks(wellnessData.breakHistory || []);
    
    // Productivity score
    const productivityScore = this.calculateProductivityScore({
      focusTime: totalFocusTime,
      completedSessions,
      completedGoals,
      goalProgress,
      wellnessScore
    });
    
    return {
      totalFocusTime,
      completedSessions,
      averageSessionLength,
      completedGoals,
      totalGoals,
      goalProgress,
      wellnessScore,
      breaksTaken,
      productivityScore,
      dailyGoalProgress: Math.min((totalFocusTime / 240) * 100, 100), // 4 hours daily goal
      streakDays: this.calculateStreakDays(sessions)
    };
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

  // Get today's goals
  getTodayGoals(goals) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return goals.filter(goal => {
      const goalDate = new Date(goal.dueDate);
      return goalDate.toDateString() === today.toDateString();
    });
  }

  // Calculate overall goal progress
  calculateOverallGoalProgress(goals) {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round((totalProgress / (goals.length * 100)) * 100);
  }

  // Calculate wellness score
  calculateWellnessScore(wellnessData) {
    if (!wellnessData) return 0;
    
    let score = 0;
    let factors = 0;
    
    // Eye rest compliance
    if (wellnessData.eyeRest?.enabled) {
      const todayBreaks = this.getTodayBreaksByType(wellnessData.breakHistory || [], 'eyeRest');
      const expectedBreaks = Math.floor(8 * 60 / wellnessData.eyeRest.interval);
      const compliance = Math.min((todayBreaks / expectedBreaks) * 100, 100);
      score += compliance * 0.3;
    }
    factors++;
    
    // Posture compliance
    if (wellnessData.posture?.enabled) {
      const todayPosture = this.getTodayBreaksByType(wellnessData.breakHistory || [], 'posture');
      const expectedPosture = Math.floor(8 * 60 / wellnessData.posture.interval);
      const compliance = Math.min((todayPosture / expectedPosture) * 100, 100);
      score += compliance * 0.3;
    }
    factors++;
    
    // Break compliance
    if (wellnessData.break?.enabled) {
      const todayBreaks = this.getTodayBreaksByType(wellnessData.breakHistory || [], 'break');
      const expectedBreaks = Math.floor(8 * 60 / wellnessData.break.interval);
      const compliance = Math.min((todayBreaks / expectedBreaks) * 100, 100);
      score += compliance * 0.4;
    }
    factors++;
    
    return Math.round(score);
  }

  // Get today's breaks by type
  getTodayBreaksByType(breakHistory, type) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return breakHistory.filter(break_ => {
      const breakDate = new Date(break_.createdAt);
      return breakDate >= today && break_.type === type;
    }).length;
  }

  // Get today's total breaks
  getTodayBreaks(breakHistory) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return breakHistory.filter(break_ => {
      const breakDate = new Date(break_.createdAt);
      return breakDate >= today;
    }).length;
  }

  // Calculate productivity score
  calculateProductivityScore(metrics) {
    let score = 0;
    
    // Focus time contribution (40%)
    const focusScore = Math.min((metrics.focusTime / 240) * 100, 100); // 4 hours target
    score += focusScore * 0.4;
    
    // Sessions contribution (20%)
    const sessionScore = Math.min((metrics.completedSessions / 6) * 100, 100); // 6 sessions target
    score += sessionScore * 0.2;
    
    // Goals contribution (20%)
    score += metrics.goalProgress * 0.2;
    
    // Wellness contribution (20%)
    score += metrics.wellnessScore * 0.2;
    
    return Math.round(score);
  }

  // Calculate streak days
  calculateStreakDays(sessions) {
    if (!sessions || sessions.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      currentDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() - 1);
      
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.createdAt);
        return sessionDate >= currentDate && sessionDate < nextDate;
      });
      
      if (daySessions.length > 0) {
        streak++;
      } else if (i > 0) { // Allow first day to have no sessions
        break;
      }
      
      currentDate = nextDate;
    }
    
    return streak;
  }

  // Generate activity feed
  generateActivityFeed(sessions, goals, wellnessData) {
    const activities = [];
    
    // Add session activities
    sessions.forEach(session => {
      activities.push({
        id: `session-${session.id}`,
        type: 'session',
        message: `Completed ${session.mode} session`,
        time: session.createdAt,
        icon: session.mode === 'work' ? 'work' : 'break',
        metadata: {
          duration: session.duration,
          mode: session.mode
        }
      });
    });
    
    // Add goal activities
    goals.forEach(goal => {
      if (goal.status === 'completed') {
        activities.push({
          id: `goal-${goal.id}`,
          type: 'goal',
          message: `Completed goal: ${goal.title}`,
          time: goal.updatedAt || goal.createdAt,
          icon: 'complete',
          metadata: {
            goalId: goal.id,
            title: goal.title
          }
        });
      }
    });
    
    // Add wellness activities
    if (wellnessData?.breakHistory) {
      wellnessData.breakHistory.forEach(break_ => {
        activities.push({
          id: `break-${break_.id}`,
          type: 'wellness',
          message: this.getWellnessActivityMessage(break_.type),
          time: break_.createdAt,
          icon: break_.type,
          metadata: {
            type: break_.type,
            duration: break_.duration
          }
        });
      });
    }
    
    // Sort by time (most recent first)
    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);
  }

  // Get wellness activity message
  getWellnessActivityMessage(type) {
    switch (type) {
      case 'eyeRest':
        return 'Took an eye rest break';
      case 'posture':
        return 'Checked posture';
      case 'break':
        return 'Took a wellness break';
      default:
        return 'Wellness activity';
    }
  }

  // Get quick stats
  getQuickStats(metrics) {
    return {
      focusTime: {
        value: metrics.totalFocusTime,
        label: 'Focus Time',
        unit: 'min',
        progress: Math.min((metrics.totalFocusTime / 240) * 100, 100),
        color: 'primary'
      },
      sessions: {
        value: metrics.completedSessions,
        label: 'Sessions',
        unit: '',
        progress: Math.min((metrics.completedSessions / 6) * 100, 100),
        color: 'success'
      },
      goals: {
        value: metrics.completedGoals,
        label: 'Goals',
        unit: '',
        progress: metrics.goalProgress,
        color: 'info'
      },
      wellness: {
        value: metrics.wellnessScore,
        label: 'Wellness',
        unit: '%',
        progress: metrics.wellnessScore,
        color: 'warning'
      }
    };
  }

  // Format time for display
  formatTime(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  // Get weekly trends
  getWeeklyTrends(sessions, goals, wellnessData) {
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.createdAt);
        return sessionDate >= date && sessionDate < nextDate;
      });
      
      const dayGoals = goals.filter(goal => {
        const goalDate = new Date(goal.dueDate);
        return goalDate.toDateString() === date.toDateString();
      });
      
      const dayBreaks = wellnessData?.breakHistory?.filter(break_ => {
        const breakDate = new Date(break_.createdAt);
        return breakDate >= date && breakDate < nextDate;
      }) || [];
      
      weekData.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        focusTime: daySessions.reduce((total, session) => total + (session.duration || 0), 0),
        sessions: daySessions.length,
        goals: dayGoals.filter(goal => goal.status === 'completed').length,
        breaks: dayBreaks.length
      });
    }
    
    return weekData;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
