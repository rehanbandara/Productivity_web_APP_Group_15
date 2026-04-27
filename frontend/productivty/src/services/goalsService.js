import { goalsAPI, apiUtils } from './api';
import { mockApi } from './mockApi';

class GoalsService {
  // Check if we should use mock API
  shouldUseMock() {
    return false; // Always use real API
  }

  // Get all goals
  async getGoals() {
    if (this.shouldUseMock()) {
      return await mockApi.getGoals();
    }
    
    try {
      const response = await goalsAPI.getAll();
      return response.data;
    } catch (error) {
      // Fallback to mock API if backend is unavailable
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.warn('Backend unavailable, using mock API');
        return await mockApi.getGoals();
      }
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get goal by ID
  async getGoalById(id) {
    if (this.shouldUseMock()) {
      return await mockApi.getGoalById(id);
    }
    
    try {
      const response = await goalsAPI.getById(id);
      return response.data;
    } catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.warn('Backend unavailable, using mock API');
        return await mockApi.getGoalById(id);
      }
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Create new goal
  async createGoal(goalData) {
    if (this.shouldUseMock()) {
      return await mockApi.createGoal(goalData);
    }
    
    try {
      const response = await goalsAPI.create(goalData);
      return response.data;
    } catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.warn('Backend unavailable, using mock API');
        return await mockApi.createGoal(goalData);
      }
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Update goal
  async updateGoal(id, goalData) {
    if (this.shouldUseMock()) {
      return await mockApi.updateGoal(id, goalData);
    }
    
    try {
      const response = await goalsAPI.update(id, goalData);
      return response.data;
    } catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.warn('Backend unavailable, using mock API');
        return await mockApi.updateGoal(id, goalData);
      }
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Delete goal
  async deleteGoal(id) {
    if (this.shouldUseMock()) {
      return await mockApi.deleteGoal(id);
    }
    
    try {
      await goalsAPI.delete(id);
      return true;
    } catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.warn('Backend unavailable, using mock API');
        return await mockApi.deleteGoal(id);
      }
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Update goal progress
  async updateGoalProgress(id, progress) {
    if (this.shouldUseMock()) {
      return await mockApi.updateGoalProgress(id, progress);
    }
    
    try {
      const response = await goalsAPI.updateProgress(id, progress);
      return response.data;
    } catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.warn('Backend unavailable, using mock API');
        return await mockApi.updateGoalProgress(id, progress);
      }
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Get goals statistics
  async getGoalsStats() {
    if (this.shouldUseMock()) {
      return await mockApi.getGoalsStats();
    }
    
    try {
      const response = await goalsAPI.getStats();
      return response.data;
    } catch (error) {
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.warn('Backend unavailable, using mock API');
        return await mockApi.getGoalsStats();
      }
      throw new Error(apiUtils.handleError(error));
    }
  }

  // Filter goals by status
  filterGoals(goals, filter) {
    if (filter === 'all') return goals;
    return goals.filter(goal => goal.status === filter);
  }

  // Calculate overall progress
  calculateOverallProgress(goals) {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round((totalProgress / (goals.length * 100)) * 100);
  }

  // Validate goal data
  validateGoal(goalData) {
    const errors = {};
    
    if (!goalData.title || goalData.title.trim() === '') {
      errors.title = 'Goal title is required';
    }
    
    if (!goalData.description || goalData.description.trim() === '') {
      errors.description = 'Description is required';
    }
    
    if (!goalData.priority) {
      errors.priority = 'Priority level is required';
    }
    
    if (!goalData.category) {
      errors.category = 'Category is required';
    }
    
    if (!goalData.dueDate) {
      errors.dueDate = 'Due date is required';
    } else if (new Date(goalData.dueDate) < new Date().setHours(0,0,0,0)) {
      errors.dueDate = 'Due date cannot be in the past';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Get goals by category
  getGoalsByCategory(goals, category) {
    return goals.filter(goal => goal.category === category);
  }

  // Get goals by priority
  getGoalsByPriority(goals, priority) {
    return goals.filter(goal => goal.priority === priority);
  }

  // Sort goals by different criteria
  sortGoals(goals, sortBy) {
    const sortedGoals = [...goals];
    
    switch (sortBy) {
      case 'title':
        return sortedGoals.sort((a, b) => a.title.localeCompare(b.title));
      case 'dueDate':
        return sortedGoals.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return sortedGoals.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      case 'progress':
        return sortedGoals.sort((a, b) => b.progress - a.progress);
      case 'created':
        return sortedGoals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return sortedGoals;
    }
  }

  // Search goals
  searchGoals(goals, searchTerm) {
    if (!searchTerm) return goals;
    
    const term = searchTerm.toLowerCase();
    return goals.filter(goal => 
      goal.title.toLowerCase().includes(term) ||
      goal.description.toLowerCase().includes(term) ||
      goal.category.toLowerCase().includes(term)
    );
  }

  // Get upcoming goals (due soon)
  getUpcomingGoals(goals, days = 7) {
    const today = new Date();
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return goals.filter(goal => {
      const dueDate = new Date(goal.dueDate);
      return dueDate >= today && dueDate <= futureDate && goal.status !== 'completed';
    });
  }

  // Get overdue goals
  getOverdueGoals(goals) {
    const today = new Date().setHours(0,0,0,0);
    
    return goals.filter(goal => {
      const dueDate = new Date(goal.dueDate);
      return dueDate < today && goal.status !== 'completed';
    });
  }
}

export const goalsService = new GoalsService();
export default goalsService;
