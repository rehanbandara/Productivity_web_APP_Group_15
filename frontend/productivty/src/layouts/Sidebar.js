import React, { useEffect, useState } from 'react';
import {
  Box, List, ListItem, ListItemIcon, ListItemText,
  Typography, Chip, Stack, Button, Divider,
} from '@mui/material';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TagIcon from '@mui/icons-material/Tag';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QuizIcon from '@mui/icons-material/Quiz';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import { tagService } from '../api/tagService';

const navGroups = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard',   icon: DashboardIcon,    path: '/' },
      { label: 'All Notes',   icon: DescriptionIcon,  path: '/notes' },
      { label: 'Topics',      icon: LocalOfferIcon,   path: '/topics' },
      { label: 'Tags',        icon: TagIcon,          path: '/tags' },
    ],
  },
  {
    label: 'Learn',
    items: [
      { label: 'Video Notes', icon: VideoLibraryIcon, path: '/video-notes' },
      { label: 'Flashcards',  icon: CreditCardIcon,   path: '/flashcards' },
      { label: 'Quizzes',     icon: QuizIcon,         path: '/quizzes' },
    ],
  },
  {
    label: 'Other',
    items: [
      { label: 'Settings',    icon: SettingsIcon,     path: '/settings' },
    ],
  },
];

export default function Sidebar({ onCreateNote, onTagClick }) {
  const location = useLocation();
  const [tags, setTags] = useState([]);

  useEffect(() => {
    tagService.getAll()
      .then((r) => setTags(r.data.slice(0, 6)))
      .catch(() => {});
  }, []);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <Box sx={{
      width: 240, bgcolor: '#fff',
      borderRight: '1px solid #f1f5f9',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Logo */}
      <Box sx={{
        px: 2.5, py: 2,
        display: 'flex', alignItems: 'center', gap: 1.5,
        borderBottom: '1px solid #f1f5f9',
      }}>
        <Box sx={{
          width: 34, height: 34, bgcolor: '#6366f1', borderRadius: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem',
        }}>
          📚
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#0f172a', lineHeight: 1.2 }}>
            StudyNote
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            Smart Learning
          </Typography>
        </Box>
      </Box>

      {/* Nav groups */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {navGroups.map((group) => (
          <Box key={group.label} sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{
              display: 'block', px: 2.5, pt: 1.5, pb: 0.5,
              fontWeight: 700, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.68rem',
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
                    component={RouterNavLink}
                    to={item.path}
                    sx={{
                      borderRadius: 1.5, mb: 0.25,
                      color: active ? '#6366f1' : '#64748b',
                      bgcolor: active ? '#eef2ff' : 'transparent',
                      '&:hover': { bgcolor: active ? '#eef2ff' : '#f8fafc', color: active ? '#6366f1' : '#0f172a' },
                      textDecoration: 'none', transition: 'all 0.15s',
                      py: 0.75, px: 1.5,
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
                        width: 4, height: 4, borderRadius: '50%', bgcolor: '#6366f1', ml: 0.5,
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
                display: 'block', fontWeight: 700, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.68rem', mb: 1,
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
                    onClick={() => onTagClick ? onTagClick(tag) : null}
                    sx={{
                      bgcolor: tag.color || '#cbd5e1',
                      color: '#fff', fontSize: '0.7rem',
                      height: 22, fontWeight: 600,
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
          fullWidth variant="contained" startIcon={<AddIcon />}
          onClick={onCreateNote}
          sx={{
            bgcolor: '#6366f1', fontWeight: 700, borderRadius: 2,
            textTransform: 'none', fontSize: '0.875rem',
            '&:hover': { bgcolor: '#4f46e5' },
          }}
        >
          Create Note
        </Button>
      </Box>
    </Box>
  );
}
