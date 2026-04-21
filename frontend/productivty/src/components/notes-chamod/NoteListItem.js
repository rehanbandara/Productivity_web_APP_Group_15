import React, { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ConfirmDialog from './ConfirmDialog';
import { formatRelativeTime, getNotePreview } from '../../utils/noteDisplay';

export default function NoteListItem({ note, onOpen, onPin, onDelete }) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const topicColor = note.topic?.color || '#6366f1';

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(note.id);
      setDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Box
        onClick={() => onOpen(note.id)}
        sx={{
          px: { xs: 2, md: 2.5 },
          py: 2,
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
          '&:hover': { bgcolor: '#f8fafc' },
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Box
            sx={{
              width: 12,
              alignSelf: 'stretch',
              display: 'flex',
              justifyContent: 'center',
              pt: 0.5,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: topicColor,
                mt: { xs: 0.5, md: 1 },
              }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{ mb: 0.5 }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.3,
                }}
              >
                {note.title || 'Untitled note'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', flexShrink: 0 }}>
                {formatRelativeTime(note.updatedAt)}
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mb: 1.25,
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {getNotePreview(note, 190)}
            </Typography>

            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
              {note.topic && (
                <Chip
                  label={note.topic.name}
                  size="small"
                  sx={{
                    height: 24,
                    bgcolor: `${topicColor}16`,
                    color: topicColor,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                  }}
                />
              )}
              {note.tags?.slice(0, 2).map((tag) => (
                <Chip
                  key={tag.id}
                  label={`#${tag.name}`}
                  size="small"
                  sx={{
                    height: 22,
                    bgcolor: '#fff',
                    color: tag.color || '#6366f1',
                    border: `1px solid ${(tag.color || '#6366f1')}30`,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
              ))}
              {note.tags?.length > 2 && (
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  +{note.tags.length - 2} more
                </Typography>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, alignSelf: { xs: 'flex-end', md: 'center' } }}>
            <Tooltip title={note.isPinned ? 'Unpin note' : 'Pin note'}>
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onPin(note.id);
                }}
                sx={{
                  color: note.isPinned ? '#f59e0b' : '#94a3b8',
                  '&:hover': {
                    bgcolor: note.isPinned ? '#fffbeb' : '#eef2ff',
                    color: note.isPinned ? '#d97706' : '#6366f1',
                  },
                }}
              >
                {note.isPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete note">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteConfirm(true);
                }}
                sx={{
                  color: '#94a3b8',
                  '&:hover': { bgcolor: '#fef2f2', color: '#ef4444' },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open note">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(note.id);
                }}
                sx={{
                  color: '#6366f1',
                  '&:hover': { bgcolor: '#eef2ff' },
                }}
              >
                <ChevronRightRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      <ConfirmDialog
        open={deleteConfirm}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(false)}
        loading={deleting}
      />
    </>
  );
}
