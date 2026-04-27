import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  LinearProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Visibility as EyeIcon,
  AccessTime as TimerIcon,
  SelfImprovement as PostureIcon,
  NotificationsActive as NotificationIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CompleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const Wellness = () => {
  // Reminder Engine State
  const [reminders, setReminders] = useState({
    eyeRest: {
      enabled: true,
      interval: 20, // minutes
      duration: 20, // seconds
      lastTriggered: null,
      isActive: false
    },
    posture: {
      enabled: true,
      interval: 45, // minutes
      duration: 15, // seconds
      lastTriggered: null,
      isActive: false
    },
    break: {
      enabled: true,
      interval: 25, // minutes
      duration: 300, // seconds (5 minutes)
      lastTriggered: null,
      isActive: false
    }
  });

  const [activeAlert, setActiveAlert] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  const [alertProgress, setAlertProgress] = useState(0);
  
  const intervalsRef = useRef({});
  const alertRef = useRef(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedReminders = localStorage.getItem('wellnessReminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('wellnessReminders', JSON.stringify(reminders));
  }, [reminders]);

  const dismissAlert = useCallback((type) => {
    if (alertRef.current) {
      clearTimeout(alertRef.current);
    }
    
    setActiveAlert(null);
    setAlertProgress(0);
    
    setReminders(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        isActive: false
      }
    }));
  }, []);

  const triggerAlert = useCallback((type) => {
    const reminderConfig = reminders[type];
    
    // Update last triggered time
    setReminders(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        lastTriggered: new Date().toISOString(),
        isActive: true
      }
    }));

    // Show alert
    setActiveAlert({
      type,
      title: getAlertTitle(type),
      message: getAlertMessage(type),
      duration: reminderConfig.duration * 1000
    });

    // Play notification sound
    playNotificationSound();

    // Auto-dismiss alert after duration
    alertRef.current = setTimeout(() => {
      dismissAlert(type);
    }, reminderConfig.duration * 1000);

    // Show progress bar
    setAlertProgress(0);
    const progressInterval = setInterval(() => {
      setAlertProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 0;
        }
        return prev + (100 / reminderConfig.duration);
      });
    }, 1000);
  }, [reminders, dismissAlert]);

  // Reminder Engine Logic
  const startReminderEngine = useCallback(() => {
    // Clear existing intervals
    Object.values(intervalsRef.current).forEach(interval => clearInterval(interval));
    
    // Eye Rest Reminder (20-20-20 rule)
    if (reminders.eyeRest.enabled) {
      intervalsRef.current.eyeRest = setInterval(() => {
        triggerAlert('eyeRest');
      }, reminders.eyeRest.interval * 60 * 1000);
    }

    // Posture Reminder
    if (reminders.posture.enabled) {
      intervalsRef.current.posture = setInterval(() => {
        triggerAlert('posture');
      }, reminders.posture.interval * 60 * 1000);
    }

    // Break Reminder
    if (reminders.break.enabled) {
      intervalsRef.current.break = setInterval(() => {
        triggerAlert('break');
      }, reminders.break.interval * 60 * 1000);
    }
  }, [reminders, triggerAlert]);

  // Start reminder engine when component mounts or settings change
  useEffect(() => {
    startReminderEngine();
    
    const currentIntervals = intervalsRef.current;
    return () => {
      Object.values(currentIntervals).forEach(interval => clearInterval(interval));
    };
  }, [startReminderEngine]);

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const getAlertTitle = (type) => {
    switch (type) {
      case 'eyeRest': return 'Eye Rest Alert';
      case 'posture': return 'Posture Check';
      case 'break': return 'Break Time';
      default: return 'Wellness Reminder';
    }
  };

  const getAlertMessage = (type) => {
    switch (type) {
      case 'eyeRest': 
        return 'Follow the 20-20-20 rule: Look at something 20 feet away for 20 seconds to reduce eye strain.';
      case 'posture': 
        return 'Check your posture: Sit up straight, shoulders back, feet flat on floor, and screen at eye level.';
      case 'break': 
        return 'Time for a break! Stand up, stretch, walk around, and give your mind a rest.';
      default: 
        return 'Take a moment for your wellness.';
    }
  };

  const handleSettingChange = (reminderType, field, value) => {
    setReminders(prev => ({
      ...prev,
      [reminderType]: {
        ...prev[reminderType],
        [field]: value
      }
    }));
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const getLastTriggeredTime = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          Wellness Center
        </Typography>

        <Grid container spacing={3}>
          {/* Status Overview */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reminder Status
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EyeIcon color={reminders.eyeRest.enabled ? 'primary' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Eye Rest Reminder (20-20-20 Rule)"
                      secondary={`Every ${formatTime(reminders.eyeRest.interval)} • Last: ${getLastTriggeredTime(reminders.eyeRest.lastTriggered)}`}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={reminders.eyeRest.enabled}
                        onChange={(e) => handleSettingChange('eyeRest', 'enabled', e.target.checked)}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <PostureIcon color={reminders.posture.enabled ? 'primary' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Posture Reminder"
                      secondary={`Every ${formatTime(reminders.posture.interval)} • Last: ${getLastTriggeredTime(reminders.posture.lastTriggered)}`}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={reminders.posture.enabled}
                        onChange={(e) => handleSettingChange('posture', 'enabled', e.target.checked)}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <TimerIcon color={reminders.break.enabled ? 'primary' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Break Reminder"
                      secondary={`Every ${formatTime(reminders.break.interval)} • Last: ${getLastTriggeredTime(reminders.break.lastTriggered)}`}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={reminders.break.enabled}
                        onChange={(e) => handleSettingChange('break', 'enabled', e.target.checked)}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Wellness Tips */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Wellness Guidelines
                </Typography>
                
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EyeIcon />
                      <Typography>20-20-20 Eye Care Rule</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      Every 20 minutes, take a 20-second break to look at something 20 feet away. 
                      This helps reduce digital eye strain and prevents computer vision syndrome.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PostureIcon />
                      <Typography>Healthy Posture Practices</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      • Keep your back straight and shoulders relaxed
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      • Position your screen at eye level (top of screen at or below eye level)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      • Keep feet flat on the floor and knees at hip level
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Take regular breaks to stand and stretch
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimerIcon />
                      <Typography>Break Benefits</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Regular breaks improve productivity, creativity, and overall well-being:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      • Reduces mental fatigue and burnout
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      • Improves focus and concentration when returning to work
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Promotes physical health through movement
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>

          {/* Settings Panel */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Settings</Typography>
                  <IconButton onClick={() => setSettingsOpen(true)}>
                    <SettingsIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Current Intervals
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    <Chip 
                      label={`Eye Rest: ${reminders.eyeRest.interval} min`}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      label={`Posture: ${reminders.posture.interval} min`}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      label={`Break: ${reminders.break.interval} min`}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Wellness reminders are running in the background. 
                    Adjust intervals or disable features in settings.
                  </Typography>
                </Alert>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<NotificationIcon />}
                  onClick={() => setNotification({ 
                    open: true, 
                    message: 'Wellness reminders are active and monitoring your health!',
                    type: 'success'
                  })}
                >
                  Test Notification
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Alert Popup Component */}
      {activeAlert && (
        <Dialog 
          open={!!activeAlert} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              position: 'fixed',
              top: 20,
              m: 2,
              maxWidth: 400
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{activeAlert.title}</Typography>
            <IconButton onClick={() => dismissAlert(activeAlert.type)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" paragraph>
              {activeAlert.message}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={alertProgress} 
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={() => dismissAlert(activeAlert.type)}
                startIcon={<CompleteIcon />}
              >
                Got it!
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Wellness Reminder Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                <EyeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Eye Rest Reminder
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={reminders.eyeRest.enabled}
                    onChange={(e) => handleSettingChange('eyeRest', 'enabled', e.target.checked)}
                  />
                }
                label="Enable"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Interval (minutes)"
                type="number"
                fullWidth
                value={reminders.eyeRest.interval}
                onChange={(e) => handleSettingChange('eyeRest', 'interval', Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: 120 }}
                disabled={!reminders.eyeRest.enabled}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                <PostureIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Posture Reminder
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={reminders.posture.enabled}
                    onChange={(e) => handleSettingChange('posture', 'enabled', e.target.checked)}
                  />
                }
                label="Enable"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Interval (minutes)"
                type="number"
                fullWidth
                value={reminders.posture.interval}
                onChange={(e) => handleSettingChange('posture', 'interval', Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: 180 }}
                disabled={!reminders.posture.enabled}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                <TimerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Break Reminder
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={reminders.break.enabled}
                    onChange={(e) => handleSettingChange('break', 'enabled', e.target.checked)}
                  />
                }
                label="Enable"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Interval (minutes)"
                type="number"
                fullWidth
                value={reminders.break.interval}
                onChange={(e) => handleSettingChange('break', 'interval', Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: 120 }}
                disabled={!reminders.break.enabled}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Wellness;
