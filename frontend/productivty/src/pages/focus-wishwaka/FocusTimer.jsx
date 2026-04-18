import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
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
  IconButton,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as ResetIcon,
  Settings as SettingsIcon,
  Work as WorkIcon,
  FreeBreakfast as BreakIcon
} from '@mui/icons-material';
import { timerService } from '../../services/timerService';

const FocusTimer = () => {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60); //countdown logic
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [recentCompletedSessions, setRecentCompletedSessions] = useState([]);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '' });
  const [tempWorkDuration, setTempWorkDuration] = useState(workDuration);
  const [tempBreakDuration, setTempBreakDuration] = useState(breakDuration);
  
  const intervalRef = useRef(null);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('focusTimerSettings');
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setWorkDuration(settings.workDuration || 25);
      setBreakDuration(settings.breakDuration || 5);
      setTimeLeft((settings.workDuration || 25) * 60);
      setTempWorkDuration(settings.workDuration || 25);
      setTempBreakDuration(settings.breakDuration || 5);
    }
  }, []);

  // Fetch recent completed sessions from API
  useEffect(() => {
    const fetchRecentSessions = async () => {
      try {
        const sessions = await timerService.getRecentCompletedSessions();
        setRecentCompletedSessions(sessions);
      } catch (error) {
        console.error('Error fetching recent sessions:', error);
      }
    };
    
    fetchRecentSessions();
  }, []);

  // Fetch completed sessions count from API
  useEffect(() => {
    const fetchCompletedCount = async () => {
      try {
        const count = await timerService.getCompletedSessionsCount();
        setCompletedSessionsCount(count);
      } catch (error) {
        console.error('Error fetching completed sessions count:', error);
      }
    };
    
    fetchCompletedCount();
  }, []);

  // Refresh recent sessions when completedSessionsCount changes
  useEffect(() => {
    const refreshSessions = async () => {
      try {
        const sessions = await timerService.getRecentCompletedSessions();
        setRecentCompletedSessions(sessions);
      } catch (error) {
        console.error('Error refreshing recent sessions:', error);
      }
    };
    
    if (completedSessionsCount > 0) {
      refreshSessions();
    }
  }, [completedSessionsCount]);

  // Save settings to localStorage
  useEffect(() => {
    const settings = { workDuration, breakDuration };
    localStorage.setItem('focusTimerSettings', JSON.stringify(settings));
  }, [workDuration, breakDuration]);

  const handleSessionComplete = useCallback(async () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);

    if (!isBreak) {
      // Work session completed - save to database
      try {
        if (currentSessionId) {
          console.log('Attempting to complete session with ID:', currentSessionId);
          await timerService.completeSession(currentSessionId);
          setNotification({ open: true, message: 'Work session complete! Time for a break!' });
          console.log('Session completed successfully');
        }
        
        // Refresh recent sessions
        const recentSessions = await timerService.getRecentCompletedSessions();
        setRecentCompletedSessions(recentSessions);
        
        // Refresh completed sessions count
        const completedCount = await timerService.getCompletedSessionsCount();
        setCompletedSessionsCount(completedCount);
      } catch (error) {
        console.error('Error saving session:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Session completed but failed to save to database';
        setNotification({ open: true, message: errorMessage });
      }
      
      playNotificationSound();
      
      // Switch to break
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
      setCurrentSessionId(null); // Reset session ID
    } else {
      // Break completed - save to database
      try {
        if (currentSessionId) {
          console.log('Attempting to complete break session with ID:', currentSessionId);
          await timerService.completeSession(currentSessionId);
          setNotification({ open: true, message: 'Break over! Back to focus!' });
          console.log('Break session completed successfully');
        }
        
        // Refresh recent sessions
        const recentSessions = await timerService.getRecentCompletedSessions();
        setRecentCompletedSessions(recentSessions);
        
        // Refresh completed sessions count
        const completedCount = await timerService.getCompletedSessionsCount();
        setCompletedSessionsCount(completedCount);
      } catch (error) {
        console.error('Error saving break session:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Break completed but failed to save to database';
        setNotification({ open: true, message: errorMessage });
      }
      
      playNotificationSound();
      
      // Switch to work
      setIsBreak(false);
      setTimeLeft(workDuration * 60);
      setCurrentSessionId(null); // Reset session ID
    }
  }, [isBreak, workDuration, breakDuration, currentSessionId]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, handleSessionComplete]);

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleStart = async () => {
    try {
      // Create a new session in the database
      const sessionData = {
        modeString: isBreak ? 'BREAK' : 'WORK',
        duration: isBreak ? breakDuration : workDuration,
        statusString: 'RUNNING',
        isRunning: true,
        timeLeft: isBreak ? breakDuration * 60 : workDuration * 60
      };
      
      const newSession = await timerService.startSession(sessionData);
      setCurrentSessionId(newSession.id);
      setIsRunning(true);
      setNotification({ open: true, message: `${isBreak ? 'Break' : 'Focus'} session started!` });
    } catch (error) {
      console.error('Error starting session:', error);
      setNotification({ open: true, message: 'Failed to start session' });
      setIsRunning(true); // Still start locally even if database fails
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
  };

  const handleSettingsSave = () => {
    setWorkDuration(tempWorkDuration);
    setBreakDuration(tempBreakDuration);
    setTimeLeft(isBreak ? tempBreakDuration * 60 : tempWorkDuration * 60);
    setSettingsOpen(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotalFocusTime = () => {
    // Use completedSessionsCount from database for accurate total
    return completedSessionsCount * 25; // Assuming 25 minutes per session as average
  };

  const formatFocusTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          Focus Timer
        </Typography>

        <Grid container spacing={3}>
          {/* Timer Display */}
          <Grid item xs={12} md={8}>
            <Card sx={{ textAlign: 'center', p: 4 }}>
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Chip 
                    icon={isBreak ? <BreakIcon /> : <WorkIcon />}
                    label={isBreak ? 'Break Time' : 'Focus Time'}
                    color={isBreak ? 'success' : 'primary'}
                    sx={{ mb: 2 }}
                  />
                </Box>
                
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <CircularProgress
                    variant="determinate"
                    value={isBreak 
                      ? ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100
                      : ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100
                    }
                    size={200}
                    thickness={8}
                    sx={{ color: isBreak ? '#4caf50' : '#2196f3' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <Typography variant="h3" component="div">
                      {formatTime(timeLeft)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {!isRunning ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayIcon />}
                      onClick={handleStart}
                      sx={{ minWidth: 120 }}
                    >
                      Start
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PauseIcon />}
                      onClick={handlePause}
                      color="warning"
                      sx={{ minWidth: 120 }}
                    >
                      Pause
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<ResetIcon />}
                    onClick={handleReset}
                    sx={{ minWidth: 120 }}
                  >
                    Reset
                  </Button>
                  
                  <IconButton
                    onClick={() => setSettingsOpen(true)}
                    sx={{ ml: 2 }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistics */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Progress
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" color="primary">
                    {completedSessionsCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total completed sessions
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {formatFocusTime(calculateTotalFocusTime())}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total focus time
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Settings
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <WorkIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Work: {workDuration} min
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    <BreakIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Break: {breakDuration} min
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Sessions */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Sessions
            </Typography>
            <List>
              {recentCompletedSessions.map((session, index) => (
                <React.Fragment key={session.id}>
                  <ListItem>
                    <ListItemIcon>
                      {session.mode === 'WORK' ? (
                        <WorkIcon color="primary" />
                      ) : (
                        <BreakIcon color="success" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${session.mode === 'WORK' ? 'Focus' : 'Break'} Session - ${session.duration} minutes`}
                      secondary={session.completedAt ? new Date(session.completedAt).toLocaleString() : 'Just completed'}
                    />
                  </ListItem>
                  {index < recentCompletedSessions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {recentCompletedSessions.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No completed sessions"
                    secondary="Complete your first focus session to see it here!"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Timer Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Work Duration (minutes)"
              type="number"
              fullWidth
              value={tempWorkDuration}
              onChange={(e) => setTempWorkDuration(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 120 }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Break Duration (minutes)"
              type="number"
              fullWidth
              value={tempBreakDuration}
              onChange={(e) => setTempBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 30 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={handleSettingsSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })}
          severity="success"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FocusTimer;
