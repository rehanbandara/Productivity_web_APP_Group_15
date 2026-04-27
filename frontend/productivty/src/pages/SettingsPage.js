import React from 'react';
import { Container, Box, Typography, Button, Paper, Stack, TextField, Switch, FormControlLabel } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import MainLayout from '../layouts/MainLayout';

export default function SettingsPage() {
  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Settings
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Manage your account preferences and settings
          </Typography>
        </Box>

        {/* Profile Section */}
        <Paper sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
            Profile Settings
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Full Name"
              defaultValue="Chamod Munasinghe"
              fullWidth
            />
            <TextField
              label="Email"
              defaultValue="chamod@studynote.com"
              fullWidth
            />
            <Button variant="outlined" sx={{ alignSelf: 'flex-start' }}>
              Update Profile
            </Button>
          </Stack>
        </Paper>

        {/* Preferences */}
        <Paper sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
            Preferences
          </Typography>
          <Stack spacing={2}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable notifications"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-save notes"
            />
            <FormControlLabel
              control={<Switch />}
              label="Dark mode"
            />
            <Button variant="outlined" sx={{ alignSelf: 'flex-start' }}>
              Save Preferences
            </Button>
          </Stack>
        </Paper>
      </Container>
    </MainLayout>
  );
}
