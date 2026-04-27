import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Stack,
  Box,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ConfirmDialog from './ConfirmDialog';
import { formatRelativeTime, getNotePreview } from '../../utils/noteDisplay';

export default function NoteCard({
  note,
  onOpen,
  onPin,
  onDelete,
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(note.id);
      setDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const summary = getNotePreview(note, 155);
  const topicColor = note.topic?.color || '#6366f1';

  return (
    <>
      <Card
        onClick={() => onOpen(note.id)}
        sx={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 230,
          borderRadius: 4,
          border: '1px solid',
          borderColor: '#e2e8f0',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            borderColor: `${topicColor}55`,
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
          },
        }}
      >
        <Box sx={{ height: 5, bgcolor: topicColor }} />

        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, height: '100%' }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: '#64748b',
                    letterSpacing: 1,
                    fontWeight: 700,
                    fontSize: '0.68rem',
                  }}
                >
                  Featured
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.25,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {note.title || 'Untitled note'}
                </Typography>
              </Box>
              <Tooltip title={note.isPinned ? 'Pinned note' : 'Unpinned note'}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: note.isPinned ? '#fffbeb' : '#f8fafc',
                    color: note.isPinned ? '#f59e0b' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <PushPinIcon fontSize="small" />
                </Box>
              </Tooltip>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: '#475569',
                fontSize: '0.92rem',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.7,
              }}
            >
              {summary}
            </Typography>

            <Stack direction="row" gap={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            {note.topic && (
              <Chip
                label={note.topic.name}
                size="small"
                sx={{
                  height: 26,
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  backgroundColor: `${topicColor}16`,
                  color: topicColor,
                }}
              />
            )}
            {note.tags?.slice(0, 2).map((tag) => (
              <Chip
                key={tag.id}
                label={`#${tag.name}`}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  color: tag.color || '#6366f1',
                  border: `1px solid ${(tag.color || '#6366f1')}30`,
                }}
              />
            ))}
            {note.tags && note.tags.length > 2 && (
              <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                +{note.tags.length - 2}
              </Typography>
            )}
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
              sx={{ mt: 'auto' }}
            >
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                Updated {formatRelativeTime(note.updatedAt)}
              </Typography>
              <Stack direction="row" spacing={0.5}>
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
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

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
