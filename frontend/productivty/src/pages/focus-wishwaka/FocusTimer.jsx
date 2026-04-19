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
  const [timeLeft, setTimeLeft] = useState(25 * 60); //countdown logic - use default initially
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [recentCompletedSessions, setRecentCompletedSessions] = useState([]);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '' });
  const [tempWorkDuration, setTempWorkDuration] = useState(25);
  const [tempBreakDuration, setTempBreakDuration] = useState(5);

  // Sync temp states with current states when dialog opens
  useEffect(() => {
    if (settingsOpen) {
      setTempWorkDuration(workDuration);
      setTempBreakDuration(breakDuration);
    }
  }, [settingsOpen, workDuration, breakDuration]);
  
  const intervalRef = useRef(null);

  // Load settings from backend
  useEffect(() => {
    const loadSettingsFromBackend = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/settings/timer');
        if (response.ok) {
          const backendSettings = await response.json();
          console.log('DEBUG: Loaded settings from backend:', backendSettings);
          
          if (backendSettings.focus) {
            const newWorkDuration = backendSettings.focus.workDuration || 25;
            const newBreakDuration = backendSettings.focus.shortBreakDuration || 5;
            
            setWorkDuration(newWorkDuration);
            setBreakDuration(newBreakDuration);
            setTempWorkDuration(newWorkDuration);
            setTempBreakDuration(newBreakDuration);
            
            // Update timeLeft only if timer is not running
            if (!isRunning) {
              setTimeLeft(isBreak ? newBreakDuration * 60 : newWorkDuration * 60);
              console.log('DEBUG: Updated timeLeft to:', isBreak ? newBreakDuration * 60 : newWorkDuration * 60);
            }
            
            console.log('DEBUG: Applied backend settings - workDuration:', newWorkDuration, 'breakDuration:', newBreakDuration);
          }
        } else {
          // Fallback to localStorage if backend is not available
          const savedSettings = localStorage.getItem('focusTimerSettings');
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            const newWorkDuration = settings.workDuration || 25;
            const newBreakDuration = settings.breakDuration || 5;
            
            setWorkDuration(newWorkDuration);
            setBreakDuration(newBreakDuration);
            setTempWorkDuration(newWorkDuration);
            setTempBreakDuration(newBreakDuration);
            
            if (!isRunning) {
              setTimeLeft(isBreak ? newBreakDuration * 60 : newWorkDuration * 60);
            }
          }
        }
      } catch (error) {
        console.error('Error loading settings from backend:', error);
        // Fallback to localStorage if backend is not available
        const savedSettings = localStorage.getItem('focusTimerSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          const newWorkDuration = settings.workDuration || 25;
          const newBreakDuration = settings.breakDuration || 5;
          
          setWorkDuration(newWorkDuration);
          setBreakDuration(newBreakDuration);
          setTempWorkDuration(newWorkDuration);
          setTempBreakDuration(newBreakDuration);
          
          if (!isRunning) {
            setTimeLeft(isBreak ? newBreakDuration * 60 : newWorkDuration * 60);
          }
        }
      }
    };

    loadSettingsFromBackend();
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
        console.log('DEBUG: Fetched completed sessions count:', count);
        setCompletedSessionsCount(count);
        console.log('DEBUG: Set completedSessionsCount state to:', count);
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
        console.log('DEBUG: Work session completion - fetched completed count:', completedCount);
        setCompletedSessionsCount(completedCount);
        console.log('DEBUG: Work session completion - set completedSessionsCount to:', completedCount);
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
        console.log('DEBUG: Break session completion - fetched completed count:', completedCount);
        setCompletedSessionsCount(completedCount);
        console.log('DEBUG: Break session completion - set completedSessionsCount to:', completedCount);
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

  const handleSettingsSave = async () => {
    try {
      console.log('DEBUG: Saving settings - workDuration:', tempWorkDuration, 'breakDuration:', tempBreakDuration);
      
      // Prepare settings data for backend
      const settingsData = {
        focus: {
          workDuration: tempWorkDuration,
          shortBreakDuration: tempBreakDuration,
          longBreakDuration: 15,
          sessionsUntilLongBreak: 4,
          autoStartBreaks: false,
          autoStartWork: false,
          soundEnabled: true,
          volume: 0.5
        }
      };

      const response = await fetch('http://localhost:8080/api/settings/timer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) {
        throw new Error('Failed to save timer settings');
      }

      const savedSettings = await response.json();
      
      // Update local state with saved data
      setWorkDuration(tempWorkDuration);
      setBreakDuration(tempBreakDuration);
      setTimeLeft(isBreak ? tempBreakDuration * 60 : tempWorkDuration * 60);
      setSettingsOpen(false);
      
      // Also save to localStorage as backup
      const settings = { workDuration: tempWorkDuration, breakDuration: tempBreakDuration };
      localStorage.setItem('focusTimerSettings', JSON.stringify(settings));
      
      console.log('DEBUG: Settings saved to backend and localStorage:', settings);
      
      // Show success notification
      setNotification({ open: true, message: 'Timer settings saved successfully!', type: 'success' });
      
    } catch (error) {
      console.error('Error saving timer settings:', error);
      
      // Fallback to localStorage if backend fails
      setWorkDuration(tempWorkDuration);
      setBreakDuration(tempBreakDuration);
      setTimeLeft(isBreak ? tempBreakDuration * 60 : tempWorkDuration * 60);
      setSettingsOpen(false);
      
      const settings = { workDuration: tempWorkDuration, breakDuration: tempBreakDuration };
      localStorage.setItem('focusTimerSettings', JSON.stringify(settings));
      
      setNotification({ open: true, message: 'Failed to save to backend, saved locally', type: 'warning' });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotalFocusTime = () => {
    console.log('DEBUG: recentCompletedSessions:', recentCompletedSessions);
    
    // Calculate total from actual completed sessions
    const totalMinutes = recentCompletedSessions.reduce((total, session) => {
      console.log('DEBUG: Processing session:', session);
      console.log('DEBUG: Session mode:', session.mode, 'Session duration:', session.duration);
      
      // Only count work sessions (not break sessions)
      if (session.mode === 'WORK' || session.mode === 'work') {
        // Convert duration from seconds to minutes
        const sessionMinutes = session.duration / 60;
        console.log('DEBUG: Adding session minutes:', sessionMinutes);
        return total + sessionMinutes;
      }
      return total;
    }, 0);
    
    console.log('DEBUG: Total minutes before rounding:', totalMinutes);
    
    // Round to nearest whole number to avoid floating-point precision issues
    const roundedTotal = Math.round(totalMinutes);
    console.log('DEBUG: Final total focus time:', roundedTotal);
    
    return roundedTotal;
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
                    {console.log('DEBUG: Rendering completedSessionsCount:', completedSessionsCount) || completedSessionsCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total completed sessions
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {console.log('DEBUG: Rendering calculateTotalFocusTime():', calculateTotalFocusTime()) || formatFocusTime(calculateTotalFocusTime())}
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
