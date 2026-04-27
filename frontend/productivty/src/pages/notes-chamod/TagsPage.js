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
  DeleteOutline,
  EditOutlined,
  LabelOutlined,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tagService } from '../../api/tagService';
import { noteService } from '../../api/noteService';
import TagForm from '../../components/notes-chamod/TagForm';
import ConfirmDialog from '../../components/notes-chamod/ConfirmDialog';
import ErrorAlert from '../../components/notes-chamod/ErrorAlert';
import MainLayout from '../../layouts/MainLayout';
import {
  WorkspaceEmptyState,
  WorkspaceHero,
  WorkspaceMetricCard,
  WorkspaceSection,
} from '../../components/workspace/WorkspaceChrome';

function TagTile({ tag, noteCount, onOpenNotes, onEdit, onDelete }) {
  const tagColor = tag.color || '#0f766e';

  return (
    <Box
      onClick={onOpenNotes}
      sx={{
        cursor: 'pointer',
        borderRadius: 4,
        border: '1px solid',
        borderColor: `${tagColor}33`,
        background: '#fff',
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 18px 34px rgba(15, 23, 42, 0.08)',
          borderColor: `${tagColor}66`,
        },
      }}
    >
      <Box sx={{ p: 2.25 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5} sx={{ mb: 1.75 }}>
          <Box
            sx={{
              px: 1.2,
              py: 0.55,
              borderRadius: 999,
              bgcolor: tagColor,
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 700,
              maxWidth: '70%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            #{tag.name}
          </Box>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit tag">
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
            <Tooltip title="Delete tag">
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

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: `${tagColor}16`,
              color: tagColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LabelOutlined sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
              {noteCount} {noteCount === 1 ? 'note' : 'notes'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Tagged with #{tag.name}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Open the notes workspace filtered by this tag.
        </Typography>
      </Box>
    </Box>
  );
}

export default function TagsPage() {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [tagsResponse, notesResponse] = await Promise.all([
        tagService.getAll(),
        noteService.getAll(),
      ]);
      setTags(tagsResponse.data);
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
      if (editingTag?.id) {
        await tagService.update(editingTag.id, values);
      } else {
        await tagService.create(values);
      }
      await loadAll();
      setDialogOpen(false);
      setEditingTag(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await tagService.delete(tagToDelete.id);
      await loadAll();
      setDeleteConfirm(false);
      setTagToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const noteCountFor = (tagId) => notes.filter((note) => note.tags?.some((tag) => tag.id === tagId)).length;
  const filteredTags = useMemo(
    () => tags.filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase())),
    [search, tags]
  );
  const taggedNotesCount = useMemo(
    () => notes.filter((note) => note.tags?.length > 0).length,
    [notes]
  );

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <ErrorAlert error={error} onClose={() => setError('')} />

        <Stack spacing={3}>
          <WorkspaceHero
            eyebrow="Cross-Labeling"
            title="Tag Library"
            description="Use tags to connect notes across topics, sharpen filters, and jump into focused note views by label."
            icon={LabelOutlined}
            accent="#0f766e"
            action={(
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingTag(null);
                  setDialogOpen(true);
                }}
                sx={{
                  alignSelf: { xs: 'stretch', md: 'auto' },
                  px: 2.25,
                  py: 1.2,
                  borderRadius: 3,
                  bgcolor: '#0f766e',
                  '&:hover': { bgcolor: '#115e59' },
                }}
              >
                New Tag
              </Button>
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <WorkspaceMetricCard
                label="Total Tags"
                value={loading ? '...' : tags.length}
                description="Reusable labels across the full workspace."
                icon={LabelOutlined}
                accent="#0f766e"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <WorkspaceMetricCard
                label="Tagged Notes"
                value={loading ? '...' : taggedNotesCount}
                description="Notes already connected through labels."
                icon={Search}
                accent="#6366f1"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <WorkspaceMetricCard
                label="Current View"
                value={search ? `${filteredTags.length} results` : 'All tags'}
                description={search ? `Filtering by “${search}”.` : 'No tag search is active.'}
                icon={Search}
                accent="#ea580c"
              />
            </Grid>
          </Grid>

          <WorkspaceSection
            title="Browse Tags"
            description="Search, edit, remove, or open any label as a filtered notes view."
          >
            <TextField
              size="small"
              placeholder="Search tags"
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
                    <Skeleton variant="rounded" height={178} sx={{ borderRadius: 4 }} />
                  </Grid>
                ))}
              </Grid>
            ) : filteredTags.length === 0 ? (
              <WorkspaceEmptyState
                icon={LabelOutlined}
                title={search ? 'No tags match this search' : 'No tags yet'}
                description={search
                  ? 'Try a different keyword or clear the search to see every tag again.'
                  : 'Create tags to connect related notes across multiple topics.'}
                action={!search ? (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      setEditingTag(null);
                      setDialogOpen(true);
                    }}
                  >
                    Create Tag
                  </Button>
                ) : null}
                accent="#0f766e"
              />
            ) : (
              <Grid container spacing={2}>
                {filteredTags.map((tag) => (
                  <Grid item xs={12} sm={6} md={4} key={tag.id}>
                    <TagTile
                      tag={tag}
                      noteCount={noteCountFor(tag.id)}
                      onOpenNotes={() => navigate(`/notes?tagId=${tag.id}`)}
                      onEdit={() => {
                        setEditingTag(tag);
                        setDialogOpen(true);
                      }}
                      onDelete={() => {
                        setTagToDelete(tag);
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
          {editingTag ? 'Edit Tag' : 'New Tag'}
        </DialogTitle>
        <DialogContent>
          <TagForm
            initialValues={editingTag}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm}
        title="Delete Tag"
        message={`Delete "${tagToDelete?.name}"? This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(false)}
        loading={deleteLoading}
      />
    </MainLayout>
  );
}
