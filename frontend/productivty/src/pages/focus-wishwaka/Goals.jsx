import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import { goalsService } from '../../services';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: 'Personal'
  });

  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    overallProgressPercentage: 0
  });

  // Load goals from API
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const goalsData = await goalsService.getGoals();
      setGoals(goalsData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = useCallback(() => {
    const total = goals.length;
    const completed = goals.filter(goal => goal.status === 'completed' || goal.status === 'COMPLETED').length;
    const inProgress = goals.filter(goal => goal.status === 'in-progress' || goal.status === 'IN_PROGRESS').length;
    const notStarted = goals.filter(goal => goal.status === 'not-started' || goal.status === 'NOT_STARTED').length;
    
    // Calculate overall progress based on individual units completed
    const totalProgressUnits = goals.reduce((sum, goal) => sum + goal.progress, 0);
    const maxPossibleProgress = total * 100; // Each goal is worth 100 progress units
    const overallProgressPercentage = maxPossibleProgress > 0 ? Math.round((totalProgressUnits / maxPossibleProgress) * 100) : 0;
    
    setStats({ 
      total, 
      completed, 
      inProgress, 
      notStarted,
      overallProgressPercentage // Add overall progress calculation
    });
  }, [goals]);

  useEffect(() => {
    updateStats();
  }, [goals, updateStats]);

  const handleCreateGoal = async () => {
    if (isFormValid()) {
      try {
        const goalData = {
          title: newGoal.title,
          description: newGoal.description,
          priority: newGoal.priority.toUpperCase(),
          progress: 0,
          completed: false,
          dueDate: newGoal.dueDate,
          status: 'NOT_STARTED',
          category: newGoal.category
        };
        
        const createdGoal = await goalsService.createGoal(goalData);
        setGoals([...goals, createdGoal]);
        setNewGoal({ title: '', description: '', priority: 'medium', dueDate: '', category: 'Personal' });
        setOpenDialog(false);
      } catch (err) {
        setError(err.message);
        console.error('Failed to create goal:', err);
      }
    }
  };

  const isFormValid = () => {
    return (
      newGoal.title.trim() &&
      newGoal.description.trim() &&
      newGoal.priority &&
      newGoal.category &&
      newGoal.dueDate &&
      new Date(newGoal.dueDate) >= new Date().setHours(0,0,0,0)
    );
  };

  const handleUpdateGoal = async (updatedGoal) => {
    try {
      const goalData = {
        ...updatedGoal,
        ...newGoal
      };
      
      const updated = await goalsService.updateGoal(updatedGoal.id, goalData);
      setGoals(goals.map(goal => 
        goal.id === updatedGoal.id ? updated : goal
      ));
      setEditingGoal(null);
      setOpenDialog(false);
    } catch (err) {
      setError(err.message);
      console.error('Failed to update goal:', err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await goalsService.deleteGoal(goalId);
      setGoals(goals.filter(goal => goal.id !== goalId));
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete goal:', err);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description,
      priority: goal.priority,
      dueDate: goal.dueDate,
      category: goal.category
    });
    setOpenDialog(true);
  };

  const handleStatusChange = (goalId, newStatus) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        let newProgress = goal.progress;
        
        // Handle different status changes
        if (newStatus === 'completed') {
          newProgress = 100;
        } else if (newStatus === 'in-progress' && goal.progress === 0) {
          newProgress = 25;
        } else if (newStatus === 'increment') {
          // Increment progress by 25% for manual progress marking
          newProgress = Math.min(goal.progress + 25, 100);
        }
        
        // Convert status to uppercase for backend compatibility
        const backendStatus = newProgress >= 100 ? 'COMPLETED' : 
                           (newProgress > 0 && newProgress < 100) ? 'IN_PROGRESS' : 
                           newStatus === 'not-started' ? 'NOT_STARTED' : newStatus.toUpperCase();
        
        return {
          ...goal,
          status: backendStatus,
          progress: newProgress,
          completed: newProgress >= 100
        };
      }
      return goal;
    }));
  };

  const incrementProgress = async (goalId) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        const newProgress = Math.min(goal.progress + 25, 100);
        const updatedGoal = await goalsService.updateGoalProgress(goalId, newProgress);
        setGoals(goals.map(g => g.id === goalId ? updatedGoal : g));
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to update progress:', err);
    }
  };

  const getFilteredGoals = () => {
    if (filter === 'all') return goals;
    // Handle both lowercase and uppercase status values
    return goals.filter(goal => {
      const goalStatus = goal.status.toLowerCase();
      const filterStatus = filter.toLowerCase();
      return goalStatus === filterStatus || 
             (filter === 'not-started' && goalStatus === 'not_started') ||
             (filter === 'in-progress' && goalStatus === 'in_progress');
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'completed': return 'success';
      case 'IN_PROGRESS':
      case 'in-progress': return 'warning';
      case 'NOT_STARTED':
      case 'not-started': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
      case 'high': return 'error';
      case 'MEDIUM':
      case 'medium': return 'warning';
      case 'LOW':
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const filteredGoals = getFilteredGoals();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Goals Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingGoal(null);
              setNewGoal({ title: '', description: '', priority: 'medium', dueDate: '', category: 'Personal' });
              setOpenDialog(true);
            }}
          >
            Add Goal
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Box sx={{ mb: 3 }}>
            <Typography color="error" sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              Error: {error}
              <Button 
                size="small" 
                onClick={() => setError(null)}
                sx={{ ml: 2 }}
              >
                Dismiss
              </Button>
            </Typography>
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <Typography>Loading goals...</Typography>
          </Box>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary">{stats.total}</Typography>
                <Typography variant="body2" color="textSecondary">Total Goals</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">{stats.completed}</Typography>
                <Typography variant="body2" color="textSecondary">Completed</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="warning.main">{stats.inProgress}</Typography>
                <Typography variant="body2" color="textSecondary">In Progress</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="info.main">{stats.notStarted}</Typography>
                <Typography variant="body2" color="textSecondary">Not Started</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary.main">{stats.overallProgressPercentage}%</Typography>
                <Typography variant="body2" color="textSecondary">Overall Progress</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.overallProgressPercentage} 
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter Buttons */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
            sx={{ mr: 1 }}
          >
            All ({stats.total})
          </Button>
          <Button
            variant={filter === 'not-started' ? 'contained' : 'outlined'}
            onClick={() => setFilter('not-started')}
            sx={{ mr: 1 }}
          >
            Not Started ({stats.notStarted})
          </Button>
          <Button
            variant={filter === 'in-progress' ? 'contained' : 'outlined'}
            onClick={() => setFilter('in-progress')}
            sx={{ mr: 1 }}
          >
            In Progress ({stats.inProgress})
          </Button>
          <Button
            variant={filter === 'completed' ? 'contained' : 'outlined'}
            onClick={() => setFilter('completed')}
          >
            Completed ({stats.completed})
          </Button>
        </Box>

        {/* Goals List */}
        <Paper sx={{ p: 2 }}>
          <List>
            {filteredGoals.map((goal) => (
              <ListItem key={goal.id} sx={{ mb: 2, p: 0 }}>
                <Card sx={{ width: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>{goal.title}</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {goal.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip 
                            label={goal.status.replace('-', ' ')} 
                            color={getStatusColor(goal.status)}
                            size="small"
                          />
                          <Chip 
                            label={goal.priority} 
                            color={getPriorityColor(goal.priority)}
                            size="small"
                          />
                          <Chip 
                            label={goal.category} 
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Box>
                        <IconButton 
                          onClick={() => handleEditGoal(goal)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteGoal(goal.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        Due: {goal.dueDate}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Progress: {goal.progress}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={goal.progress} 
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => incrementProgress(goal.id)}
                          disabled={goal.status === 'completed'}
                          sx={{ minWidth: 80 }}
                        >
                          +25%
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => incrementProgress(goal.id)}
                          disabled={goal.status === 'completed'}
                          sx={{ minWidth: 80 }}
                        >
                          +50%
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => incrementProgress(goal.id)}
                          disabled={goal.status === 'completed'}
                          sx={{ minWidth: 80 }}
                        >
                          +75%
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => incrementProgress(goal.id)}
                          disabled={goal.status === 'completed'}
                          sx={{ minWidth: 80 }}
                        >
                          +100%
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleStatusChange(goal.id, 'not-started')}
                        disabled={goal.status === 'not-started'}
                      >
                        Not Started
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleStatusChange(goal.id, 'in-progress')}
                        disabled={goal.status === 'in-progress'}
                      >
                        In Progress
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleStatusChange(goal.id, 'completed')}
                        disabled={goal.status === 'completed'}
                        startIcon={<CompleteIcon />}
                      >
                        Complete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </ListItem>
            ))}
          </List>
        </Paper>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Goal Title"
            fullWidth
            variant="outlined"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            sx={{ mb: 2 }}
            required
            error={!newGoal.title.trim()}
            helperText={!newGoal.title.trim() ? "Goal title is required" : ""}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
            sx={{ mb: 2 }}
            required
            error={!newGoal.description.trim()}
            helperText={!newGoal.description.trim() ? "Description is required" : ""}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }} required error={!newGoal.priority}>
                <InputLabel>Priority Level</InputLabel>
                <Select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                  error={!newGoal.priority}
                >
                  <MenuItem value="high">High Priority</MenuItem>
                  <MenuItem value="medium">Medium Priority</MenuItem>
                  <MenuItem value="low">Low Priority</MenuItem>
                </Select>
                {!newGoal.priority && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    Priority level is required
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }} required error={!newGoal.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  error={!newGoal.category}
                >
                  <MenuItem value="Work">Work</MenuItem>
                  <MenuItem value="Personal">Personal</MenuItem>
                  <MenuItem value="Learning">Learning</MenuItem>
                  <MenuItem value="Health">Health</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {!newGoal.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    Category is required
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
          
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            value={newGoal.dueDate}
            onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            required
            error={!newGoal.dueDate || new Date(newGoal.dueDate) < new Date().setHours(0,0,0,0)}
            helperText={
              !newGoal.dueDate 
                ? "Due date is required" 
                : new Date(newGoal.dueDate) < new Date().setHours(0,0,0,0)
                ? "Due date cannot be in the past"
                : ""
            }
            inputProps={{
              min: new Date().toISOString().split('T')[0]
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={editingGoal ? () => handleUpdateGoal({ ...editingGoal, ...newGoal }) : handleCreateGoal} 
            variant="contained"
            disabled={!isFormValid()}
          >
            {editingGoal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </DialogActions>
      </Dialog>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Goals;
