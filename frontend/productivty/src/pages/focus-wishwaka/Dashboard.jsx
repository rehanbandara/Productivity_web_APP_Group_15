import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Refresh as ResetIcon,
  Work as WorkIcon,
  FreeBreakfast as BreakIcon,
  SelfImprovement as PostureIcon
} from '@mui/icons-material';

const Dashboard = () => {
  // Focus Timer State
  const [timerState, setTimerState] = useState({
    mode: 'work', // 'work' | 'break'
    isRunning: false,
    timeLeft: 25 * 60, // seconds
    currentSession: 1
  });

  // Productivity Summary State
  const [productivity, setProductivity] = useState({
    completedSessions: 3,
    totalFocusTime: 125, // minutes
    tasksCompleted: 8
  });

  // Wellness Status State
  const [wellness] = useState({
    lastBreak: '10:30 AM',
    eyeRestStatus: 'Good',
    postureReminder: 'Active'
  });

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerState.isRunning && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (timerState.timeLeft === 0) {
      // Session completed
      setTimerState(prev => ({
        ...prev,
        isRunning: false,
        mode: prev.mode === 'work' ? 'break' : 'work',
        timeLeft: prev.mode === 'work' ? 5 * 60 : 25 * 60
      }));
      
      if (timerState.mode === 'work') {
        setProductivity(prev => ({
          ...prev,
          completedSessions: prev.completedSessions + 1,
          totalFocusTime: prev.totalFocusTime + 25
        }));
      }
    }

    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.timeLeft, timerState.mode, timerState.currentSession]);

  const formatFocusTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleStartPause = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: !prev.isRunning
    }));
  };

  const handleReset = () => {
    setTimerState({
      mode: 'work',
      isRunning: false,
      timeLeft: 25 * 60,
      currentSession: timerState.currentSession + 1
    });
  };

  const handleTakeBreak = () => {
    setTimerState({
      mode: 'break',
      isRunning: false,
      timeLeft: 5 * 60,
      currentSession: timerState.currentSession
    });
  };

  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Productivity Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* 1. Quick Actions - Moved to Top */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PlayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Quick Actions
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<PlayIcon />}
                      onClick={handleStartPause}
                      disabled={timerState.isRunning && timerState.mode === 'work'}
                      sx={{ mb: 1 }}
                    >
                      Start Focus
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<BreakIcon />}
                      onClick={handleTakeBreak}
                      sx={{ mb: 1 }}
                    >
                      Take Break
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<ResetIcon />}
                      onClick={handleReset}
                    >
                      Reset Timer
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          
          {/* 3. Today's Productivity Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Productivity Summary
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Completed Sessions</Typography>
                      <Typography variant="h6" color="primary.main">{productivity.completedSessions}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Total Focus Time</Typography>
                      <Typography variant="h6" color="success.main">{formatFocusTime(productivity.totalFocusTime)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Tasks Completed</Typography>
                      <Typography variant="h6" color="info.main">{productivity.tasksCompleted}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="text.secondary" align="center">
                  Session {timerState.currentSession} • {new Date().toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          
          {/* 5. Wellness Status */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PostureIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Wellness Status
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Last Break</Typography>
                      <Typography variant="body2" color="secondary.main">{wellness.lastBreak}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Eye Rest Status</Typography>
                      <Chip 
                        label={wellness.eyeRestStatus}
                        color={wellness.eyeRestStatus === 'Good' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Posture Reminder</Typography>
                      <Chip 
                        label={wellness.postureReminder}
                        color={wellness.postureReminder === 'Active' ? 'info' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
