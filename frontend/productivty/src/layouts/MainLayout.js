import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

export default function MainLayout({ children, onCreateNote, onTagClick }) {
  const navigate = useNavigate();
  const handleCreateNote = () => {
    if (onCreateNote) {
      onCreateNote();
      return;
    }

    navigate('/notes/new');
  };

  const handleTagClick = (tag) => {
    if (onTagClick) {
      onTagClick(tag);
      return;
    }

    navigate(`/notes?tagId=${tag.id}`);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8fafc' }}>
      {/* Sidebar */}
      <Sidebar onCreateNote={handleCreateNote} onTagClick={handleTagClick} />

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Header */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: '#fff',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: -0.5,
              }}
            >
              Study Note System
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small">
                <NotificationsIcon sx={{ color: '#64748b' }} />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <Box sx={{ textAlign: 'right', mr: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                    Chamod M.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
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
