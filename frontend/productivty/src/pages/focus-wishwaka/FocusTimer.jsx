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
  FreeBreakfast as BreakIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';

const FocusTimer = () => {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60); //countdown logic
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '' });
  const [tempWorkDuration, setTempWorkDuration] = useState(workDuration);
  const [tempBreakDuration, setTempBreakDuration] = useState(breakDuration);
  
  const intervalRef = useRef(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('focusTimerSessions');
    const savedSettings = localStorage.getItem('focusTimerSettings');
    
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      
      // Filter today's sessions
      const today = new Date().toDateString();
      const todaysSessions = parsedSessions.filter(session => 
        new Date(session.date).toDateString() === today
      );
      setTodaySessions(todaysSessions);
    }
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setWorkDuration(settings.workDuration || 25);
      setBreakDuration(settings.breakDuration || 5);
      setTimeLeft((settings.workDuration || 25) * 60);
      setTempWorkDuration(settings.workDuration || 25);
      setTempBreakDuration(settings.breakDuration || 5);
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    const settings = { workDuration, breakDuration };
    localStorage.setItem('focusTimerSettings', JSON.stringify(settings));
  }, [workDuration, breakDuration]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);

    if (!isBreak) {
      // Work session completed
      const newSession = {
        id: Date.now(),
        date: new Date().toISOString(),
        duration: workDuration,
        type: 'work'
      };
      
      const updatedSessions = [...sessions, newSession];
      setSessions(updatedSessions);
      localStorage.setItem('focusTimerSessions', JSON.stringify(updatedSessions));
      
      // Update today's sessions
      const today = new Date().toDateString();
      const todaysSessions = updatedSessions.filter(session => 
        new Date(session.date).toDateString() === today
      );
      setTodaySessions(todaysSessions);
      
      setNotification({ open: true, message: '🎉 Work session complete! Time for a break!' });
      playNotificationSound();
      
      // Switch to break
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
    } else {
      // Break completed
      setNotification({ open: true, message: '💪 Break over! Back to focus!' });
      playNotificationSound();
      
      // Switch to work
      setIsBreak(false);
      setTimeLeft(workDuration * 60);
    }
  }, [isBreak, workDuration, breakDuration, sessions]);

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

  const handleStart = () => {
    setIsRunning(true);
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
    return todaySessions.reduce((total, session) => total + session.duration, 0);
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
                    {todaySessions.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Sessions completed
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
              {todaySessions.slice(-5).reverse().map((session, index) => (
                <React.Fragment key={session.id}>
                  <ListItem>
                    <ListItemIcon>
                      <CompleteIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Focus Session - ${session.duration} minutes`}
                      secondary={new Date(session.date).toLocaleTimeString()}
                    />
                  </ListItem>
                  {index < todaySessions.slice(-5).length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {todaySessions.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No sessions completed today"
                    secondary="Start your first focus session to begin tracking!"
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
