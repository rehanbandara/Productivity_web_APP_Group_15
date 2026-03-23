import React from 'react';
import {
  Paper,
  Typography,
  Chip,
  IconButton,
  Box,
  LinearProgress,
  Button
} from '@mui/material';
import {
  CheckCircle as CompleteIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

const GoalCard = ({ goal, onUpdateProgress, onDelete }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">{goal.title}</Typography>
        <Box>
          <Chip 
            label={goal.priority} 
            color={getPriorityColor(goal.priority)}
            size="small"
            sx={{ mr: 1 }}
          />
          <IconButton 
            onClick={() => onDelete(goal.id)}
            color="error"
            size="small"
          >
            ×
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ mr: 2 }}>
          <TimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
          Due: {goal.dueDate}
        </Typography>
        {goal.completed && (
          <Chip 
            icon={<CompleteIcon />}
            label="Completed"
            color="success"
            size="small"
          />
        )}
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" gutterBottom>
          Progress: {goal.progress}%
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={goal.progress} 
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[25, 50, 75, 100].map((value) => (
            <Button
              key={value}
              variant="outlined"
              size="small"
              onClick={() => onUpdateProgress(goal.id, value)}
              disabled={goal.progress >= value}
              sx={{ minWidth: '60px' }}
            >
              {value}%
            </Button>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default GoalCard;
