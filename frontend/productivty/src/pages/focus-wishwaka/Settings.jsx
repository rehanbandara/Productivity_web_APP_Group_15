import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  InputLabel,
  Slider,
  Chip,
  Paper,
  Divider,
  Snackbar,
  Alert,
  Container
} from '@mui/material';
import {
  Timer as FocusIcon,
  SelfImprovement as WellnessIcon,
  NotificationsActive as NotificationIcon,
  Work as WorkIcon,
  FreeBreakfast as BreakIcon,
  AccessTime as LongBreakIcon,
  Visibility as EyeIcon,
  Settings as SettingsIcon,
  PlayArrow as TestIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const Settings = () => {
  // Navigation state
  const [activeSection, setActiveSection] = useState('focus');
  
  // Focus/Pomodoro Settings
  const [focusSettings, setFocusSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartNextSession: true,
    autoStartBreaks: true
  });

  // Wellness Settings
  const [wellnessSettings, setWellnessSettings] = useState({
    breakReminderEnabled: true,
    breakReminderInterval: 25,
    eyeRestInterval: 20,
    postureReminderInterval: 45,
    eyeRestEnabled: true,
    postureEnabled: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    soundEnabled: true,
    notificationType: 'both',
    volume: 70
  });

  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedFocusSettings = localStorage.getItem('focusSettings');
    const savedWellnessSettings = localStorage.getItem('wellnessSettings');
    const savedNotificationSettings = localStorage.getItem('notificationSettings');

    if (savedFocusSettings) {
      setFocusSettings(JSON.parse(savedFocusSettings));
    }
    if (savedWellnessSettings) {
      setWellnessSettings(JSON.parse(savedWellnessSettings));
    }
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('focusSettings', JSON.stringify(focusSettings));
  }, [focusSettings]);

  useEffect(() => {
    localStorage.setItem('wellnessSettings', JSON.stringify(wellnessSettings));
  }, [wellnessSettings]);

  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const navigationItems = [
    { id: 'focus', label: 'Focus Settings', icon: <FocusIcon />, description: 'Pomodoro timer configuration' },
    { id: 'wellness', label: 'Wellness Settings', icon: <WellnessIcon />, description: 'Health and break reminders' },
    { id: 'notifications', label: 'Notifications', icon: <NotificationIcon />, description: 'Alert preferences' }
  ];

  const handleFocusSettingChange = (field, value) => {
    setFocusSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWellnessSettingChange = (field, value) => {
    setWellnessSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationSettingChange = (field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ open: true, message, type });
  };

  const resetToDefaults = () => {
    setFocusSettings({
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      autoStartNextSession: true,
      autoStartBreaks: true
    });
    setWellnessSettings({
      breakReminderEnabled: true,
      breakReminderInterval: 25,
      eyeRestInterval: 20,
      postureReminderInterval: 45,
      eyeRestEnabled: true,
      postureEnabled: true
    });
    setNotificationSettings({
      enabled: true,
      soundEnabled: true,
      notificationType: 'both',
      volume: 70
    });
    showNotification('All settings reset to defaults!');
  };

  const renderFocusSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Work Session
            </Typography>
            <TextField
              fullWidth
              label="Work Duration (minutes)"
              type="number"
              value={focusSettings.workDuration}
              onChange={(e) => handleFocusSettingChange('workDuration', Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 120 }}
              sx={{ mb: 2 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <BreakIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Break Settings
            </Typography>
            <TextField
              fullWidth
              label="Short Break Duration (minutes)"
              type="number"
              value={focusSettings.shortBreakDuration}
              onChange={(e) => handleFocusSettingChange('shortBreakDuration', Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 30 }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Long Break Duration (minutes)"
              type="number"
              value={focusSettings.longBreakDuration}
              onChange={(e) => handleFocusSettingChange('longBreakDuration', Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 60 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <LongBreakIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Session Configuration
            </Typography>
            <TextField
              fullWidth
              label="Sessions Before Long Break"
              type="number"
              value={focusSettings.sessionsBeforeLongBreak}
              onChange={(e) => handleFocusSettingChange('sessionsBeforeLongBreak', Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 10 }}
              sx={{ mb: 2 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Automation
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={focusSettings.autoStartNextSession}
                  onChange={(e) => handleFocusSettingChange('autoStartNextSession', e.target.checked)}
                />
              }
              label="Auto-start next session"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={focusSettings.autoStartBreaks}
                  onChange={(e) => handleFocusSettingChange('autoStartBreaks', e.target.checked)}
                />
              }
              label="Auto-start breaks"
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderWellnessSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <FocusIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Break Reminder
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={wellnessSettings.breakReminderEnabled}
                  onChange={(e) => handleWellnessSettingChange('breakReminderEnabled', e.target.checked)}
                />
              }
              label="Enable Break Reminder"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Break Reminder Interval (minutes)"
              type="number"
              value={wellnessSettings.breakReminderInterval}
              onChange={(e) => handleWellnessSettingChange('breakReminderInterval', Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 120 }}
              disabled={!wellnessSettings.breakReminderEnabled}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <EyeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Eye-Rest Alert (20-20-20 Rule)
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={wellnessSettings.eyeRestEnabled}
                  onChange={(e) => handleWellnessSettingChange('eyeRestEnabled', e.target.checked)}
                />
              }
              label="Enable Eye-Rest Alert"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Eye-Rest Interval (minutes)"
              type="number"
              value={wellnessSettings.eyeRestInterval}
              onChange={(e) => handleWellnessSettingChange('eyeRestInterval', Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 60 }}
              disabled={!wellnessSettings.eyeRestEnabled}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <WellnessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Posture Reminder
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={wellnessSettings.postureEnabled}
                  onChange={(e) => handleWellnessSettingChange('postureEnabled', e.target.checked)}
                />
              }
              label="Enable Posture Reminder"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Posture Reminder Interval (minutes)"
              type="number"
              value={wellnessSettings.postureReminderInterval}
              onChange={(e) => handleWellnessSettingChange('postureReminderInterval', Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 180 }}
              disabled={!wellnessSettings.postureEnabled}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Wellness Guidelines
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" paragraph>
                <strong>20-20-20 Rule:</strong> Every 20 minutes, look at something 20 feet away for 20 seconds.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Posture:</strong> Check posture every 30-60 minutes for optimal ergonomics.
              </Typography>
              <Typography variant="body2">
                <strong>Breaks:</strong> Take regular breaks to prevent fatigue and maintain productivity.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderNotificationSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <NotificationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Notification Preferences
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.enabled}
                  onChange={(e) => handleNotificationSettingChange('enabled', e.target.checked)}
                />
              }
              label="Enable Notifications"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.soundEnabled}
                  onChange={(e) => handleNotificationSettingChange('soundEnabled', e.target.checked)}
                  disabled={!notificationSettings.enabled}
                />
              }
              label="Sound Alerts"
              sx={{ mb: 2 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <NotificationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Notification Type
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Notification Type</InputLabel>
              <Select
                value={notificationSettings.notificationType}
                onChange={(e) => handleNotificationSettingChange('notificationType', e.target.value)}
                disabled={!notificationSettings.enabled}
              >
                <MenuItem value="popup">Popup Only</MenuItem>
                <MenuItem value="sound">Sound Only</MenuItem>
                <MenuItem value="both">Both</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <NotificationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Volume Control
            </Typography>
            <Typography variant="body2" gutterBottom>
              Volume: {notificationSettings.volume}%
            </Typography>
            <Slider
              value={notificationSettings.volume}
              onChange={(e, value) => handleNotificationSettingChange('volume', value)}
              disabled={!notificationSettings.enabled || !notificationSettings.soundEnabled}
              min={0}
              max={100}
              step={5}
              marks={[
                { value: 0, label: '0%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' }
              ]}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <TestIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Test Notifications
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                if (notificationSettings.enabled) {
                  showNotification('Test notification sent!', 'success');
                  if (notificationSettings.soundEnabled) {
                    // Play test sound
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = 800;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(notificationSettings.volume / 100 * 0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                  }
                } else {
                  showNotification('Please enable notifications first!', 'warning');
                }
              }}
            >
              Test Notification
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'focus':
        return renderFocusSettings();
      case 'wellness':
        return renderWellnessSettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return renderFocusSettings();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Horizontal Navigation */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? 'contained' : 'outlined'}
                    startIcon={item.icon}
                    onClick={() => setActiveSection(item.id)}
                    sx={{
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      justifyContent: 'flex-start',
                      minWidth: 180,
                      textTransform: 'none',
                      '& .MuiButton-startIcon': {
                        mr: 1
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Button>
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={resetToDefaults}
                  startIcon={<RefreshIcon />}
                >
                  Reset to Defaults
                </Button>
                
                <Alert severity="warning" sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    Changes are saved automatically
                  </Typography>
                </Alert>
              </Box>
            </Paper>
          </Grid>

          {/* Content Area */}
          <Grid item xs={12}>
            {renderContent()}
          </Grid>
        </Grid>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.type} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
