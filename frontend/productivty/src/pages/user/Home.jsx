import React from 'react';
import { Box, Container, Typography, Button, Paper, Grid, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  SelfImprovement as WellnessIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <TimerIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Focus Timer',
      description: 'Pomodoro timer with customizable work and break sessions to boost productivity.'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: 'Goal Tracking',
      description: 'Set and track your personal goals with progress visualization and achievements.'
    },
    {
      icon: <WellnessIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      title: 'Wellness Reminders',
      description: 'Stay healthy with eye rest, posture, and break reminders throughout your day.'
    },
    {
      icon: <SettingsIcon sx={{ fontSize: 40, color: theme.palette.info.main }} />,
      title: 'Personal Settings',
      description: 'Customize your experience with personalized settings and preferences.'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.contrastText,
              mb: 2
            }}
          >
            Productivity Dashboard
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.primary.contrastText,
              mb: 4,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Transform your productivity with smart focus management, goal tracking, and wellness features designed for modern professionals.
          </Typography>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                borderColor: theme.palette.primary.contrastText,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  borderColor: theme.palette.primary.contrastText,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Create Account
            </Button>
          </Box>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Benefits Section */}
        <Paper
          elevation={6}
          sx={{
            p: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            Why Choose Productivity Dashboard?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}>
            Our comprehensive productivity platform helps you maintain focus, achieve your goals, and prioritize your well-being. 
            With intelligent reminders and customizable settings, you'll build better habits and reach your full potential.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2
              }}
            >
              Get Started Today
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
