import React from 'react';
import {
  Paper,
  Typography,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  FreeBreakfast as BreakIcon,
  Visibility as EyeRestIcon,
  SelfImprovement as PostureIcon,
  NotificationsActive as WellnessIcon
} from '@mui/icons-material';

const WellnessAlert = ({ type, message, onClose, visible }) => {
  if (!visible) return null;

  const getAlertConfig = (type) => {
    switch (type) {
      case 'break':
        return {
          bgcolor: '#ff9800',
          icon: <BreakIcon />,
          title: 'Break Time!',
          color: 'white'
        };
      case 'eyeRest':
        return {
          bgcolor: '#4caf50',
          icon: <EyeRestIcon />,
          title: 'Eye Rest Alert',
          color: 'white'
        };
      case 'posture':
        return {
          bgcolor: '#2196f3',
          icon: <PostureIcon />,
          title: 'Posture Check',
          color: 'white'
        };
      default:
        return {
          bgcolor: '#757575',
          icon: <WellnessIcon />,
          title: 'Wellness Reminder',
          color: 'white'
        };
    }
  };

  const config = getAlertConfig(type);

  return (
    <Paper sx={{ m: 2, p: 2, bgcolor: config.bgcolor, color: config.color, position: 'relative' }}>
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8, color: config.color }}
        size="small"
      >
        <CloseIcon />
      </IconButton>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {config.icon}
        <Typography variant="h6">{config.title}</Typography>
      </Box>
      <Typography>{message}</Typography>
    </Paper>
  );
};

export default WellnessAlert;
