import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import UnifiedSidebar from './UnifiedSidebar';

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <UnifiedSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* AppBar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: '#fff',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
            {/* Mobile hamburger */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { md: 'none' }, color: '#64748b' }}
            >
              <MenuIcon />
            </IconButton>

            {/* Right side: notification + avatar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              <IconButton size="small">
                <NotificationsIcon sx={{ color: '#64748b' }} />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <Box sx={{ textAlign: 'right', mr: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: '#0f172a' }}
                  >
                    Chamod M.
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: '#94a3b8' }}
                  >
                    Student
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#6366f1',
                    fontWeight: 700,
                  }}
                >
                  CM
                </Avatar>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: '#f8fafc',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
