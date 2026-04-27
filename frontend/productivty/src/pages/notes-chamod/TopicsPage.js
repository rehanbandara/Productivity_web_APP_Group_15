import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  ArticleOutlined,
  DeleteOutline,
  EditOutlined,
  FolderOutlined,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { topicService } from '../../api/topicService';
import { noteService } from '../../api/noteService';
import TopicForm from '../../components/notes-chamod/TopicForm';
import ConfirmDialog from '../../components/notes-chamod/ConfirmDialog';
import ErrorAlert from '../../components/notes-chamod/ErrorAlert';
import MainLayout from '../../layouts/MainLayout';
import {
  WorkspaceEmptyState,
  WorkspaceHero,
  WorkspaceMetricCard,
  WorkspaceSection,
} from '../../components/workspace/WorkspaceChrome';

function TopicTile({ topic, noteCount, onOpenNotes, onEdit, onDelete }) {
  const topicColor = topic.color || '#6366f1';

  return (
    <Box
      onClick={onOpenNotes}
      sx={{
        cursor: 'pointer',
        borderRadius: 4,
        border: '1px solid',
        borderColor: '#e2e8f0',
        background: '#fff',
        overflow: 'hidden',
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 18px 34px rgba(15, 23, 42, 0.08)',
          borderColor: `${topicColor}55`,
        },
      }}
    >
      <Box sx={{ height: 6, bgcolor: topicColor }} />
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5} sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              bgcolor: `${topicColor}16`,
              color: topicColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FolderOutlined sx={{ fontSize: 22 }} />
          </Box>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit topic">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
                sx={{ '&:hover': { bgcolor: '#eff6ff' } }}
              >
                <EditOutlined fontSize="small" sx={{ color: '#2563eb' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete topic">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
                sx={{ '&:hover': { bgcolor: '#fef2f2' } }}
              >
                <DeleteOutline fontSize="small" sx={{ color: '#ef4444' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.75 }}>
          {topic.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 66,
            mb: 1.75,
          }}
        >
          {topic.description || 'No description yet. Add some context to make this topic easier to scan later.'}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              px: 1.1,
              py: 0.55,
              borderRadius: 999,
              bgcolor: `${topicColor}16`,
              color: topicColor,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <ArticleOutlined sx={{ fontSize: 14 }} />
            {noteCount} {noteCount === 1 ? 'note' : 'notes'}
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            Open filtered notes
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export default function TopicsPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [topicsResponse, notesResponse] = await Promise.all([
        topicService.getAll(),
        noteService.getAll(),
      ]);
      setTopics(topicsResponse.data);
      setNotes(notesResponse.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setFormLoading(true);
    setError('');
    try {
      if (editingTopic?.id) {
        await topicService.update(editingTopic.id, values);
      } else {
        await topicService.create(values);
      }
      await loadAll();
      setDialogOpen(false);
      setEditingTopic(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await topicService.delete(topicToDelete.id);
      await loadAll();
      setDeleteConfirm(false);
      setTopicToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredTopics = useMemo(
    () => topics.filter((topic) => topic.name.toLowerCase().includes(search.toLowerCase())),
    [search, topics]
  );
  const topicsWithNotes = useMemo(
    () => topics.filter((topic) => notes.some((note) => note.topic?.id === topic.id)).length,
    [notes, topics]
  );

  const noteCountFor = (topicId) => notes.filter((note) => note.topic?.id === topicId).length;

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <ErrorAlert error={error} onClose={() => setError('')} />

        <Stack spacing={3}>
          <WorkspaceHero
            eyebrow="Organization"
            title="Topics Library"
            description="Shape the main structure of your study system, keep related notes together, and open filtered note views directly from each topic."
            icon={FolderOutlined}
            accent="#ea580c"
            action={(
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingTopic(null);
                  setDialogOpen(true);
                }}
                sx={{
                  alignSelf: { xs: 'stretch', md: 'auto' },
                  px: 2.25,
                  py: 1.2,
                  borderRadius: 3,
                  bgcolor: '#ea580c',
                  '&:hover': { bgcolor: '#c2410c' },
                }}
              >
                New Topic
              </Button>
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <WorkspaceMetricCard
                label="Total Topics"
                value={loading ? '...' : topics.length}
                description="Distinct study lanes in your workspace."
                icon={FolderOutlined}
                accent="#ea580c"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <WorkspaceMetricCard
                label="Active Topics"
                value={loading ? '...' : topicsWithNotes}
                description="Topics that already contain at least one note."
                icon={ArticleOutlined}
                accent="#6366f1"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <WorkspaceMetricCard
                label="Current View"
                value={search ? `${filteredTopics.length} results` : 'All topics'}
                description={search ? `Filtering by “${search}”.` : 'No topic search is active.'}
                icon={Search}
                accent="#0f766e"
              />
            </Grid>
          </Grid>

          <WorkspaceSection
            title="Browse Topics"
            description="Search, edit, or remove topics, then jump into the matching notes."
          >
            <TextField
              size="small"
              placeholder="Search topics"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                maxWidth: 420,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#f8fafc',
                },
              }}
            />

            {loading ? (
              <Grid container spacing={2}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item}>
                    <Skeleton variant="rounded" height={240} sx={{ borderRadius: 4 }} />
                  </Grid>
                ))}
              </Grid>
            ) : filteredTopics.length === 0 ? (
              <WorkspaceEmptyState
                icon={FolderOutlined}
                title={search ? 'No topics match this search' : 'No topics yet'}
                description={search
                  ? 'Try a different keyword or clear the current search.'
                  : 'Create your first topic to give the notes workspace a cleaner structure.'}
                action={!search ? (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      setEditingTopic(null);
                      setDialogOpen(true);
                    }}
                  >
                    Create Topic
                  </Button>
                ) : null}
                accent="#ea580c"
              />
            ) : (
              <Grid container spacing={2}>
                {filteredTopics.map((topic) => (
                  <Grid item xs={12} sm={6} md={4} key={topic.id}>
                    <TopicTile
                      topic={topic}
                      noteCount={noteCountFor(topic.id)}
                      onOpenNotes={() => navigate(`/notes?topicId=${topic.id}`)}
                      onEdit={() => {
                        setEditingTopic(topic);
                        setDialogOpen(true);
                      }}
                      onDelete={() => {
                        setTopicToDelete(topic);
                        setDeleteConfirm(true);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </WorkspaceSection>
        </Stack>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {editingTopic ? 'Edit Topic' : 'New Topic'}
        </DialogTitle>
        <DialogContent>
          <TopicForm
            initialValues={editingTopic}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm}
        title="Delete Topic"
        message={`Delete "${topicToDelete?.name}"? This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(false)}
        loading={deleteLoading}
      />
    </MainLayout>
  );
}
