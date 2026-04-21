import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
  CircularProgress,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { topicService } from '../../api/topicService';
import { tagService } from '../../api/tagService';
import NoteEditor from '../../components/notes-chamod/NoteEditor';
import ErrorAlert from '../../components/notes-chamod/ErrorAlert';
import MainLayout from '../../layouts/MainLayout';

export default function NoteEditorPage({ isNew = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [topics, setTopics] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const noteId = isNew ? 'new' : id;
  const returnPath = location.search ? `/notes${location.search}` : '/notes';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [topicsRes, tagsRes] = await Promise.all([
        topicService.getAll(),
        tagService.getAll(),
      ]);
      setTopics(topicsRes.data);
      setTags(tagsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout
        onCreateNote={() => navigate(location.search ? `/notes/new${location.search}` : '/notes/new')}
        onTagClick={(tag) => navigate(`/notes?tagId=${tag.id}`)}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      onCreateNote={() => navigate(location.search ? `/notes/new${location.search}` : '/notes/new')}
      onTagClick={(tag) => navigate(`/notes?tagId=${tag.id}`)}
    >
      <Box sx={{ maxWidth: 980, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <ErrorAlert error={error} onClose={() => setError('')} />

        <Stack spacing={3}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(returnPath)}
              sx={{
                mb: 2,
                px: 0,
                color: '#475569',
                textTransform: 'none',
                '&:hover': { bgcolor: 'transparent', color: '#0f172a' },
              }}
            >
              Back to Notes
            </Button>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Chip
                icon={<EditNoteOutlinedIcon sx={{ fontSize: 16 }} />}
                label={isNew ? 'New Note' : 'Editing'}
                sx={{
                  bgcolor: '#eef2ff',
                  color: '#4338ca',
                  fontWeight: 700,
                  '& .MuiChip-icon': { color: '#6366f1' },
                }}
              />
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Your dashboard filters are preserved while you edit.
              </Typography>
            </Stack>

            <Typography variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 800, letterSpacing: -0.8 }}>
              {isNew ? 'Create a fresh note' : 'Refine your note'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.7, maxWidth: 720 }}>
              Use the full page to focus on the draft, apply tags and topics, and save when you are ready to return to the notes workspace.
            </Typography>
          </Box>

          <Card
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: '#e2e8f0',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.06)',
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <NoteEditor
                noteId={noteId}
                topics={topics}
                tags={tags}
                onSaved={() => navigate(returnPath)}
                onDeleted={() => navigate(returnPath)}
              />
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </MainLayout>
  );
}
