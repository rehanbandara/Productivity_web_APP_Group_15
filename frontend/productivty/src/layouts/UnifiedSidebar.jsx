import React, { useEffect, useState } from 'react';
import {
  Box, List, ListItem, ListItemIcon, ListItemText,
  Typography, Chip, Stack, Button, Divider,
  Drawer, useTheme, useMediaQuery
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TagIcon from '@mui/icons-material/Tag';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QuizIcon from '@mui/icons-material/Quiz';
import SettingsIcon from '@mui/icons-material/Settings';
import FlagIcon from '@mui/icons-material/Flag';
import TimerIcon from '@mui/icons-material/Timer';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import ChecklistIcon from '@mui/icons-material/Checklist';
import FolderIcon from '@mui/icons-material/Folder';
import { tagService } from '../api/tagService';

const drawerWidth = 240;

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
    ],
  },
  {
    label: 'Notes',
    items: [
      { label: 'All Notes', icon: DescriptionIcon, path: '/notes' },
      { label: 'Topics', icon: LocalOfferIcon, path: '/topics' },
      { label: 'Tags', icon: TagIcon, path: '/tags' },
    ],
  },
  {
    label: 'Learn',
    items: [
      { label: 'Video Notes', icon: VideoLibraryIcon, path: '/video-notes' },
      { label: 'Flashcards', icon: CreditCardIcon, path: '/flashcards' },
      { label: 'Quizzes', icon: QuizIcon, path: '/quizzes' },
    ],
  },
  {
    label: 'Focus',
    items: [
      { label: 'Goals', icon: FlagIcon, path: '/goals' },
      { label: 'Focus Timer', icon: TimerIcon, path: '/focus-timer' },
      { label: 'Wellness', icon: FavoriteIcon, path: '/wellness' },
    ],
  },
  {
    label: 'Planner',
    items: [
      { label: 'Task Management', icon: ChecklistIcon, path: '/planner' },
    ],
  },
  {
    label: 'Files',
    items: [
      { label: 'My Files', icon: FolderIcon, path: '/files' },
    ],
  },
  {
    label: 'Other',
    items: [
      { label: 'Settings', icon: SettingsIcon, path: '/settings' },
    ],
  },
];

export default function UnifiedSidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tags, setTags] = useState([]);

  useEffect(() => {
    tagService.getAll()
      .then((r) => setTags(r.data.slice(0, 6)))
      .catch(() => {});
  }, []);

  const isActive = (path) =>
    path === '/dashboard' ? (location.pathname === '/dashboard' || location.pathname === '/') : location.pathname.startsWith(path);

  const handleCreateNote = () => {
    navigate('/notes/new');
    if (isMobile) onClose();
  };

  const handleTagClick = (tag) => {
    navigate(`/notes?tagId=${tag.id}`);
    if (isMobile) onClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const sidebarContent = (
    <Box sx={{
      width: '100%',
      bgcolor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Logo */}
      <Box sx={{
        px: 2.5,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderBottom: '1px solid #f1f5f9',
      }}>
        <Box sx={{
          width: 34,
          height: 34,
          bgcolor: '#6366f1',
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
        }}>
          ⚡
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#0f172a', lineHeight: 1.2 }}>
            Productivity Hub
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            Smart Workspace
          </Typography>
        </Box>
      </Box>

      {/* Nav groups */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {navGroups.map((group) => (
          <Box key={group.label} sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{
              display: 'block',
              px: 2.5,
              pt: 1.5,
              pb: 0.5,
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              fontSize: '0.68rem',
            }}>
              {group.label}
            </Typography>
            <List dense disablePadding sx={{ px: 1 }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <ListItem
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.25,
                      color: active ? '#6366f1' : '#64748b',
                      bgcolor: active ? '#eef2ff' : 'transparent',
                      '&:hover': {
                        bgcolor: active ? '#eef2ff' : '#f8fafc',
                        color: active ? '#6366f1' : '#0f172a',
                      },
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      py: 0.75,
                      px: 1.5,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: active ? 700 : 500,
                        fontSize: '0.875rem',
                        color: 'inherit',
                      }}
                    />
                    {active && (
                      <Box sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        bgcolor: '#6366f1',
                        ml: 0.5,
                      }} />
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}

        {/* Tags section */}
        {tags.length > 0 && (
          <>
            <Divider sx={{ mx: 2, my: 1 }} />
            <Box sx={{ px: 2.5, pb: 1 }}>
              <Typography variant="caption" sx={{
                display: 'block',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                fontSize: '0.68rem',
                mb: 1,
              }}>
                Tags
              </Typography>
              <Stack direction="row" gap={0.5} flexWrap="wrap">
                {tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    size="small"
                    clickable
                    onClick={() => handleTagClick(tag)}
                    sx={{
                      bgcolor: tag.color || '#cbd5e1',
                      color: '#fff',
                      fontSize: '0.7rem',
                      height: 22,
                      fontWeight: 600,
                      '&:hover': { opacity: 0.85 },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Box>

      {/* Create Note button */}
      <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNote}
          sx={{
            bgcolor: '#6366f1',
            fontWeight: 700,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.875rem',
            '&:hover': { bgcolor: '#4f46e5' },
          }}
        >
          Create Note
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid #f1f5f9',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </Box>
  );
}
