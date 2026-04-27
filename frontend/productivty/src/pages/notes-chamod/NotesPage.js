import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add,
  AutoAwesomeOutlined,
  Clear,
  FilterListRounded,
  FolderOpenOutlined,
  PushPin,
  Search,
  StickyNote2Outlined,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { noteService } from '../../api/noteService';
import { tagService } from '../../api/tagService';
import { topicService } from '../../api/topicService';
import ErrorAlert from '../../components/notes-chamod/ErrorAlert';
import MainLayout from '../../layouts/MainLayout';
import NoteCard from '../../components/notes-chamod/NoteCard';
import NoteListItem from '../../components/notes-chamod/NoteListItem';

function OverviewCard({ label, value, accent, description, icon: Icon }) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        border: '1px solid',
        borderColor: '#e2e8f0',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                color: '#64748b',
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: '0.68rem',
                mb: 0.75,
              }}
            >
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {description}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              bgcolor: `${accent}16`,
              color: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function NotesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [notes, setNotes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      topicId: searchParams.get('topicId') || '',
      tagId: searchParams.get('tagId') || '',
    }),
    [searchParams]
  );
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    Promise.all([topicService.getAll(), tagService.getAll()])
      .then(([tr, gr]) => {
        setTopics(tr.data);
        setTags(gr.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  const updateFilters = useCallback((nextFilters, options = {}) => {
    const params = new URLSearchParams();
    const trimmedSearch = nextFilters.search.trim();

    if (trimmedSearch) {
      params.set('search', trimmedSearch);
    }
    if (nextFilters.topicId) {
      params.set('topicId', String(nextFilters.topicId));
    }
    if (nextFilters.tagId) {
      params.set('tagId', String(nextFilters.tagId));
    }

    setSearchParams(params, { replace: options.replace ?? false });
  }, [setSearchParams]);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.topicId) params.topicId = filters.topicId;
      if (filters.tagId) params.tagId = filters.tagId;
      const res = await noteService.getAll(params);
      setNotes(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.tagId, filters.topicId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== filters.search) {
        updateFilters({ ...filters, search: searchInput }, { replace: true });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [filters, searchInput, updateFilters]);

  const buildPathWithFilters = useCallback((path, nextFilters = filters) => {
    const params = new URLSearchParams();
    const trimmedSearch = nextFilters.search.trim();

    if (trimmedSearch) {
      params.set('search', trimmedSearch);
    }
    if (nextFilters.topicId) {
      params.set('topicId', String(nextFilters.topicId));
    }
    if (nextFilters.tagId) {
      params.set('tagId', String(nextFilters.tagId));
    }

    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  }, [filters]);

  const handleSelectNote = (id) => {
    navigate(buildPathWithFilters(`/notes/${id}`, {
      ...filters,
      search: searchInput,
    }));
  };

  const handleNewNote = () => {
    navigate(buildPathWithFilters('/notes/new', {
      ...filters,
      search: searchInput,
    }));
  };

  const handlePin = async (noteId) => {
    try {
      await noteService.togglePin(noteId);
      await loadNotes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await noteService.delete(noteId);
      await loadNotes();
    } catch (err) {
      setError(err.message);
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    updateFilters({ search: '', topicId: '', tagId: '' });
  };

  const hasFilters = filters.search || filters.topicId || filters.tagId;
  const pinnedNotes = notes.filter((n) => n.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);
  const activeTopic = topics.find((topic) => String(topic.id) === String(filters.topicId));
  const activeTag = tags.find((tag) => String(tag.id) === String(filters.tagId));
  const activeViewLabel = activeTag
    ? `Tag: ${activeTag.name}`
    : activeTopic
      ? `Topic: ${activeTopic.name}`
      : filters.search
        ? 'Search results'
        : 'All notes';

  return (
    <MainLayout
      onCreateNote={handleNewNote}
      onTagClick={(tag) => navigate(`/notes?tagId=${tag.id}`)}
    >
      <Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <ErrorAlert error={error} onClose={() => setError('')} />

        <Stack spacing={3}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ maxWidth: 720 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.8, mb: 1 }}>
                Notes Workspace
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.7 }}>
                A calmer dashboard for reviewing what matters, resurfacing pinned material,
                and jumping into focused editing when you are ready to write.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNewNote}
              sx={{
                alignSelf: { xs: 'stretch', sm: 'auto' },
                px: 2.25,
                py: 1.25,
                borderRadius: 3,
                bgcolor: '#4f46e5',
                '&:hover': { bgcolor: '#4338ca' },
              }}
            >
              New Note
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <OverviewCard
                label="Visible Notes"
                value={notes.length}
                description={`${unpinnedNotes.length} in the main stream`}
                accent="#6366f1"
                icon={StickyNote2Outlined}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <OverviewCard
                label="Pinned Notes"
                value={pinnedNotes.length}
                description={pinnedNotes.length > 0 ? 'Featured at the top of the workspace' : 'Nothing pinned yet'}
                accent="#f59e0b"
                icon={PushPin}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <OverviewCard
                label="Active View"
                value={activeViewLabel}
                description={hasFilters ? 'Query string state is preserved for reload and navigation' : 'Browse every note in one place'}
                accent="#0f766e"
                icon={FilterListRounded}
              />
            </Grid>
          </Grid>

          <Card
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: '#e2e8f0',
              boxShadow: '0 16px 35px rgba(15, 23, 42, 0.05)',
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5}>
                  <TextField
                    placeholder="Search by title or content"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchInput ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSearchInput('');
                              updateFilters({ ...filters, search: '' }, { replace: true });
                            }}
                          >
                            <Clear sx={{ fontSize: 18, color: '#94a3b8' }} />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: '#f8fafc',
                      },
                    }}
                  />

                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                    <Select
                      value={filters.topicId}
                      displayEmpty
                      onChange={(event) => updateFilters({
                        ...filters,
                        search: searchInput,
                        topicId: event.target.value,
                        tagId: '',
                      })}
                      sx={{
                        borderRadius: 3,
                        bgcolor: '#f8fafc',
                      }}
                    >
                      <MenuItem value="">All topics</MenuItem>
                      {topics.map((topic) => (
                        <MenuItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                    <Select
                      value={filters.tagId}
                      displayEmpty
                      onChange={(event) => updateFilters({
                        ...filters,
                        search: searchInput,
                        tagId: event.target.value,
                        topicId: '',
                      })}
                      sx={{
                        borderRadius: 3,
                        bgcolor: '#f8fafc',
                      }}
                    >
                      <MenuItem value="">All tags</MenuItem>
                      {tags.map((tag) => (
                        <MenuItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.25}
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {filters.search && (
                      <Chip
                        label={`Search: ${filters.search}`}
                        onDelete={() => {
                          setSearchInput('');
                          updateFilters({ ...filters, search: '' }, { replace: true });
                        }}
                        sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 600 }}
                      />
                    )}
                    {activeTopic && (
                      <Chip
                        label={`Topic: ${activeTopic.name}`}
                        onDelete={() => updateFilters({ ...filters, search: searchInput, topicId: '' })}
                        sx={{ bgcolor: '#fff7ed', color: '#c2410c', fontWeight: 600 }}
                      />
                    )}
                    {activeTag && (
                      <Chip
                        label={`Tag: ${activeTag.name}`}
                        onDelete={() => updateFilters({ ...filters, search: searchInput, tagId: '' })}
                        sx={{ bgcolor: '#ecfeff', color: '#0f766e', fontWeight: 600 }}
                      />
                    )}
                    {!hasFilters && (
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        No filters active.
                      </Typography>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      {notes.length} result{notes.length === 1 ? '' : 's'}
                    </Typography>
                    {hasFilters && (
                      <Button
                        size="small"
                        onClick={clearFilters}
                        sx={{ textTransform: 'none', color: '#64748b' }}
                      >
                        Reset filters
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {loading ? (
            <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: '#e2e8f0' }}>
              <CardContent sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                </Box>
              </CardContent>
            </Card>
          ) : notes.length === 0 ? (
            <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: '#e2e8f0' }}>
              <CardContent sx={{ py: 9, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 68,
                    height: 68,
                    mx: 'auto',
                    mb: 2,
                    borderRadius: 3,
                    bgcolor: hasFilters ? '#fff7ed' : '#eef2ff',
                    color: hasFilters ? '#c2410c' : '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {hasFilters ? <FilterListRounded sx={{ fontSize: 34 }} /> : <AutoAwesomeOutlined sx={{ fontSize: 34 }} />}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                  {hasFilters ? 'No notes match this view' : 'Start your notes workspace'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 420, mx: 'auto', mb: 3 }}>
                  {hasFilters
                    ? 'Try clearing the current search or switching to another topic or tag.'
                    : 'Create your first note to populate the dashboard, pin important material, and build a cleaner study workflow.'}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} justifyContent="center">
                  {!hasFilters && (
                    <Button variant="contained" startIcon={<Add />} onClick={handleNewNote}>
                      Create Note
                    </Button>
                  )}
                  {hasFilters && (
                    <Button variant="outlined" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={3}>
              {pinnedNotes.length > 0 && (
                <Box>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    sx={{ mb: 1.5 }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Featured Pinned Notes
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Keep high-priority notes visible while the rest of the stream stays focused.
                      </Typography>
                    </Box>
                    <Chip
                      icon={<PushPin sx={{ fontSize: 16 }} />}
                      label={`${pinnedNotes.length} pinned`}
                      sx={{
                        bgcolor: '#fffbeb',
                        color: '#b45309',
                        fontWeight: 700,
                        '& .MuiChip-icon': { color: '#f59e0b' },
                      }}
                    />
                  </Stack>

                  <Grid container spacing={2}>
                    {pinnedNotes.map((note) => (
                      <Grid item xs={12} md={6} xl={4} key={note.id}>
                        <NoteCard
                          note={note}
                          onOpen={handleSelectNote}
                          onPin={handlePin}
                          onDelete={handleDelete}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Card
                sx={{
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: '#e2e8f0',
                  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.05)',
                  overflow: 'hidden',
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      px: { xs: 2, md: 2.5 },
                      py: 2.25,
                      borderBottom: '1px solid #e2e8f0',
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          All Notes
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          Unpinned notes ordered by most recent updates.
                        </Typography>
                      </Box>
                      <Chip
                        icon={<FolderOpenOutlined sx={{ fontSize: 16 }} />}
                        label={`${unpinnedNotes.length} in main stream`}
                        sx={{
                          bgcolor: '#f8fafc',
                          color: '#475569',
                          fontWeight: 700,
                        }}
                      />
                    </Stack>
                  </Box>

                  {unpinnedNotes.length > 0 ? (
                    <Box>
                      {unpinnedNotes.map((note, index) => (
                        <React.Fragment key={note.id}>
                          <NoteListItem
                            note={note}
                            onOpen={handleSelectNote}
                            onPin={handlePin}
                            onDelete={handleDelete}
                          />
                          {index < unpinnedNotes.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ px: 2.5, py: 6, textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                        Everything is pinned
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Unpin a note to bring it back into the main reading stream.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Stack>
          )}
        </Stack>
      </Box>
    </MainLayout>
  );
}
