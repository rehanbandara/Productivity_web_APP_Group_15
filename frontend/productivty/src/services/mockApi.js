// Mock API service for development without backend server
class MockApiService {
  constructor() {
    this.goals = [
      { 
        id: 1, 
        title: 'Complete React Project', 
        description: 'Finish the frontend for the productivity app',
        priority: 'high', 
        progress: 75, 
        completed: false, 
        dueDate: '2024-12-25',
        status: 'in-progress',
        category: 'Work',
        createdAt: '2024-04-01T10:00:00Z',
        updatedAt: '2024-04-08T10:00:00Z'
      },
      { 
        id: 2, 
        title: 'Study JavaScript 2 hours', 
        description: 'Complete JavaScript advanced concepts',
        priority: 'medium', 
        progress: 50, 
        completed: false, 
        dueDate: '2024-12-24',
        status: 'in-progress',
        category: 'Learning',
        createdAt: '2024-04-01T11:00:00Z',
        updatedAt: '2024-04-08T11:00:00Z'
      },
      { 
        id: 3, 
        title: 'Read Documentation', 
        description: 'Read React documentation for new features',
        priority: 'low', 
        progress: 25, 
        completed: false, 
        dueDate: '2024-12-26',
        status: 'not-started',
        category: 'Learning',
        createdAt: '2024-04-01T12:00:00Z',
        updatedAt: '2024-04-08T12:00:00Z'
      },
      { 
        id: 4, 
        title: 'Exercise Routine', 
        description: 'Complete 30 minutes of workout',
        priority: 'medium', 
        progress: 100, 
        completed: true, 
        dueDate: '2024-12-23',
        status: 'completed',
        category: 'Health',
        createdAt: '2024-04-01T13:00:00Z',
        updatedAt: '2024-04-08T13:00:00Z'
      }
    ];

    this.nextId = 5;
  }

  // Simulate network delay
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Goals API
  async getGoals() {
    await this.delay();
    return [...this.goals];
  }

  async getGoalById(id) {
    await this.delay();
    const goal = this.goals.find(g => g.id === parseInt(id));
    if (!goal) {
      throw new Error('Goal not found');
    }
    return { ...goal };
  }

  async createGoal(goalData) {
    await this.delay();
    const newGoal = {
      id: this.nextId++,
      ...goalData,
      progress: 0,
      completed: false,
      status: 'not-started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.goals.push(newGoal);
    return { ...newGoal };
  }

  async updateGoal(id, goalData) {
    await this.delay();
    const index = this.goals.findIndex(g => g.id === parseInt(id));
    if (index === -1) {
      throw new Error('Goal not found');
    }
    
    this.goals[index] = {
      ...this.goals[index],
      ...goalData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.goals[index] };
  }

  async deleteGoal(id) {
    await this.delay();
    const index = this.goals.findIndex(g => g.id === parseInt(id));
    if (index === -1) {
      throw new Error('Goal not found');
    }
    
    this.goals.splice(index, 1);
    return true;
  }

  async updateGoalProgress(id, progress) {
    await this.delay();
    const index = this.goals.findIndex(g => g.id === parseInt(id));
    if (index === -1) {
      throw new Error('Goal not found');
    }
    
    this.goals[index] = {
      ...this.goals[index],
      progress,
      status: progress >= 100 ? 'completed' : (progress > 0 && progress < 100) ? 'in-progress' : 'not-started',
      completed: progress >= 100,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.goals[index] };
  }

  async getGoalsStats() {
    await this.delay();
    const total = this.goals.length;
    const completed = this.goals.filter(g => g.status === 'completed').length;
    const inProgress = this.goals.filter(g => g.status === 'in-progress').length;
    const notStarted = this.goals.filter(g => g.status === 'not-started').length;
    
    const totalProgressUnits = this.goals.reduce((sum, goal) => sum + goal.progress, 0);
    const maxPossibleProgress = total * 100;
    const overallProgressPercentage = maxPossibleProgress > 0 ? Math.round((totalProgressUnits / maxPossibleProgress) * 100) : 0;
    
    return {
      total,
      completed,
      inProgress,
      notStarted,
      overallProgressPercentage
    };
  }

  // Timer API
  async getCurrentSession() {
    await this.delay();
    return {
      id: 1,
      mode: 'work',
      isRunning: false,
      timeLeft: 25 * 60,
      currentSession: 1,
      duration: 25,
      startTime: null,
      status: 'paused'
    };
  }

  async startSession(sessionData) {
    await this.delay();
    return {
      id: Date.now(),
      ...sessionData,
      status: 'running',
      startTime: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
  }

  async pauseSession(sessionId) {
    await this.delay();
    return { id: sessionId, status: 'paused', pausedAt: new Date().toISOString() };
  }

  async resumeSession(sessionId) {
    await this.delay();
    return { id: sessionId, status: 'running', resumedAt: new Date().toISOString() };
  }

  async completeSession(sessionId) {
    await this.delay();
    return { 
      id: sessionId, 
      status: 'completed', 
      completedAt: new Date().toISOString(),
      duration: 25
    };
  }

  async getSessionHistory(params = {}) {
    await this.delay();
    return [
      {
        id: 1,
        mode: 'work',
        duration: 25,
        status: 'completed',
        createdAt: '2024-04-08T09:00:00Z',
        completedAt: '2024-04-08T09:25:00Z'
      },
      {
        id: 2,
        mode: 'break',
        duration: 5,
        status: 'completed',
        createdAt: '2024-04-08T09:25:00Z',
        completedAt: '2024-04-08T09:30:00Z'
      },
      {
        id: 3,
        mode: 'work',
        duration: 25,
        status: 'completed',
        createdAt: '2024-04-08T10:00:00Z',
        completedAt: '2024-04-08T10:25:00Z'
      }
    ];
  }

  async getTodayStats() {
    await this.delay();
    return {
      totalSessions: 3,
      completedSessions: 3,
      totalFocusTime: 75,
      averageSessionLength: 25,
      completionRate: 100
    };
  }

  // Wellness API
  async getReminders() {
    await this.delay();
    return {
      eyeRest: {
        enabled: true,
        interval: 20,
        duration: 20,
        lastTriggered: null,
        isActive: false
      },
      posture: {
        enabled: true,
        interval: 45,
        duration: 15,
        lastTriggered: null,
        isActive: false
      },
      break: {
        enabled: true,
        interval: 25,
        duration: 300,
        lastTriggered: null,
        isActive: false
      }
    };
  }

  async updateReminders(reminders) {
    await this.delay();
    return { ...reminders, updatedAt: new Date().toISOString() };
  }

  async getWellnessStats() {
    await this.delay();
    return {
      totalBreaks: 8,
      eyeRestBreaks: 3,
      postureBreaks: 2,
      regularBreaks: 3,
      wellnessScore: 75,
      complianceRate: 85
    };
  }

  async logBreak(breakData) {
    await this.delay();
    return {
      id: Date.now(),
      ...breakData,
      createdAt: new Date().toISOString()
    };
  }

  async getBreakHistory(params = {}) {
    await this.delay();
    return [
      {
        id: 1,
        type: 'eyeRest',
        duration: 20,
        createdAt: '2024-04-08T09:20:00Z'
      },
      {
        id: 2,
        type: 'posture',
        duration: 15,
        createdAt: '2024-04-08T10:05:00Z'
      },
      {
        id: 3,
        type: 'break',
        duration: 300,
        createdAt: '2024-04-08T11:00:00Z'
      }
    ];
  }

  // Settings API
  async getUserSettings() {
    await this.delay();
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
          interval: 20,
          duration: 20,
          soundEnabled: true
        },
        posture: {
          enabled: true,
          interval: 45,
          duration: 15,
          soundEnabled: true
        },
        break: {
          enabled: true,
          interval: 25,
          duration: 300,
          soundEnabled: true
        }
      },
      notifications: {
        desktop: true,
        sound: true,
        email: false,
        push: false,
        reminderLeadTime: 5
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

  async updateSettings(settings) {
    await this.delay();
    return { ...settings, updatedAt: new Date().toISOString() };
  }

  async resetToDefaults() {
    await this.delay();
    return await this.getUserSettings();
  }

  // Dashboard API
  async getDashboardOverview() {
    await this.delay();
    const goalsStats = await this.getGoalsStats();
    const todayStats = await this.getTodayStats();
    const wellnessStats = await this.getWellnessStats();
    
    return {
      goals: goalsStats,
      timer: todayStats,
      wellness: wellnessStats,
      productivity: {
        score: 85,
        streak: 5,
        weeklyProgress: 70
      }
    };
  }

  async getProductivityStats(period = 'week') {
    await this.delay();
    return {
      period,
      totalFocusTime: period === 'week' ? 375 : 1500,
      completedSessions: period === 'week' ? 15 : 60,
      averageSessionLength: 25,
      completionRate: 92,
      dailyGoalProgress: 78
    };
  }

  async getRecentActivity() {
    await this.delay();
    return [
      {
        id: 1,
        type: 'session',
        message: 'Completed work session',
        time: '09:25 AM',
        icon: 'work'
      },
      {
        id: 2,
        type: 'break',
        message: 'Took a wellness break',
        time: '09:30 AM',
        icon: 'break'
      },
      {
        id: 3,
        type: 'goal',
        message: 'Completed goal: Exercise Routine',
        time: '08:00 AM',
        icon: 'complete'
      }
    ];
  }

  async getUpcomingGoals() {
    await this.delay();
    return this.goals
      .filter(goal => goal.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);
  }

  async getWellnessStatus() {
    await this.delay();
    return {
      lastBreak: '10:30 AM',
      eyeRestStatus: 'Good',
      postureReminder: 'Active',
      nextBreak: '11:00 AM',
      wellnessScore: 75
    };
  }
}

export const mockApi = new MockApiService();
export default mockApi;
