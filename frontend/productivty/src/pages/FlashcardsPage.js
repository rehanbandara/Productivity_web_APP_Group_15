import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  AutoAwesome,
  CheckCircle,
  DeleteOutline,
  RefreshOutlined,
  School,
  Search,
  StyleOutlined,
  YouTube,
} from '@mui/icons-material';
import MainLayout from '../layouts/MainLayout';
import { noteService } from '../api/noteService';
import { flashcardService } from '../api/flashcardService';
import { videoNoteService } from '../api/videoNoteService';
import {
  WorkspaceEmptyState,
  WorkspaceHero,
  WorkspaceMetricCard,
  WorkspaceSection,
} from '../components/workspace/WorkspaceChrome';
import { getNotePreview } from '../utils/noteDisplay';

const DIFFICULTY_CONFIG = {
  EASY: { label: 'Easy', accent: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  MEDIUM: { label: 'Medium', accent: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  HARD: { label: 'Hard', accent: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
};

function FlashCard({ card, index }) {
  const [flipped, setFlipped] = useState(false);
  const config = DIFFICULTY_CONFIG[card.difficulty] || DIFFICULTY_CONFIG.MEDIUM;

  return (
    <Card
      onClick={() => setFlipped((prev) => !prev)}
      sx={{
        cursor: 'pointer',
        minHeight: 240,
        borderRadius: 4,
        border: '1.5px solid',
        borderColor: flipped ? '#a5b4fc' : config.border,
        bgcolor: flipped ? '#eef2ff' : config.bg,
        boxShadow: '0 16px 30px rgba(15, 23, 42, 0.06)',
        userSelect: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 22px 40px rgba(15, 23, 42, 0.1)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, height: '100%' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip
              label={flipped ? 'Answer' : config.label}
              size="small"
              sx={{
                bgcolor: flipped ? '#eef2ff' : '#fff',
                color: flipped ? '#4338ca' : config.accent,
                border: `1px solid ${flipped ? '#c7d2fe' : config.border}`,
                fontWeight: 700,
              }}
            />
            <Chip
              label={`#${index + 1}`}
              size="small"
              sx={{ bgcolor: '#fff', color: '#475569', fontWeight: 700 }}
            />
          </Stack>

          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography
              variant="body1"
              sx={{
                color: '#0f172a',
                lineHeight: 1.8,
                fontWeight: flipped ? 400 : 700,
                textAlign: 'center',
              }}
            >
              {flipped ? card.answer : card.question}
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ textAlign: 'center', color: '#64748b' }}>
            {flipped ? 'Click to flip back to the question.' : 'Click to reveal the answer.'}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function NotePickerCard({ note, selected, hasVideo, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderRadius: 4,
        border: '1px solid',
        borderColor: selected ? '#818cf8' : '#e2e8f0',
        bgcolor: selected ? '#eef2ff' : '#fff',
        p: 2.25,
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 34px rgba(15, 23, 42, 0.08)',
          borderColor: '#818cf8',
        },
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" spacing={1.5} alignItems="flex-start">
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.4 }} noWrap>
              {note.title || 'Untitled note'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {getNotePreview(note, 90)}
            </Typography>
          </Box>
          {hasVideo && (
            <Tooltip title="Has linked video note">
              <YouTube fontSize="small" sx={{ color: '#dc2626', flexShrink: 0 }} />
            </Tooltip>
          )}
        </Stack>

        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
          {note.topic && (
            <Chip
              label={note.topic.name}
              size="small"
              sx={{
                bgcolor: `${note.topic.color || '#6366f1'}16`,
                color: note.topic.color || '#6366f1',
                fontWeight: 700,
              }}
            />
          )}
          {selected && (
            <Chip
              icon={<CheckCircle sx={{ fontSize: 14 }} />}
              label="Selected"
              size="small"
              sx={{
                bgcolor: '#eef2ff',
                color: '#4338ca',
                fontWeight: 700,
                '& .MuiChip-icon': { color: '#6366f1' },
              }}
            />
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

export default function FlashcardsPage() {
  const [notes, setNotes] = useState([]);
  const [videoNoteIds, setVideoNoteIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [includeVideoNote, setIncludeVideoNote] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });

  useEffect(() => {
    (async () => {
      try {
        const response = await noteService.getAll();
        setNotes(response.data);
        const ids = new Set();
        await Promise.all(response.data.map(async (note) => {
          try {
            await videoNoteService.get(note.id);
            ids.add(note.id);
          } catch (_) {
            // Ignore notes without video metadata.
          }
        }));
        setVideoNoteIds(ids);
      } catch (_) {
        setSnack({ open: true, type: 'error', text: 'Failed to load notes' });
      }
    })();
  }, []);

  const loadFlashcards = useCallback(async (noteId) => {
    setLoading(true);
    try {
      const response = await flashcardService.getAll(noteId);
      setFlashcards(response.data);
    } catch (_) {
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setIncludeVideoNote(false);
    loadFlashcards(note.id);
  };

  const handleGenerate = async () => {
    if (!selectedNote) {
      return;
    }

    setGenerating(true);
    try {
      const response = await flashcardService.generate(selectedNote.id, includeVideoNote);
      setFlashcards(response.data);
      setSnack({ open: true, type: 'success', text: `Generated ${response.data.length} flashcards.` });
    } catch (err) {
      setSnack({
        open: true,
        type: 'error',
        text: err.response?.data?.message || 'Flashcard generation failed',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (cardId) => {
    try {
      await flashcardService.delete(selectedNote.id, cardId);
      setFlashcards((prev) => prev.filter((card) => card.id !== cardId));
      setSnack({ open: true, type: 'success', text: 'Flashcard deleted' });
    } catch (_) {
      setSnack({ open: true, type: 'error', text: 'Failed to delete flashcard' });
    }
  };

  const filteredNotes = useMemo(
    () => notes.filter((note) => note.title.toLowerCase().includes(search.toLowerCase())),
    [notes, search]
  );
  const hasVideoForSelected = selectedNote && videoNoteIds.has(selectedNote.id);
  const difficultyCounts = {
    easy: flashcards.filter((card) => card.difficulty === 'EASY').length,
    medium: flashcards.filter((card) => card.difficulty === 'MEDIUM').length,
    hard: flashcards.filter((card) => card.difficulty === 'HARD').length,
  };

  if (!selectedNote) {
    return (
      <MainLayout>
        <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
          <Stack spacing={3}>
            <WorkspaceHero
              eyebrow="Active Recall"
              title="Flashcards"
              description="Pick a note, optionally include its linked video transcript, and generate study cards in the same visual system as the rest of the workspace."
              icon={StyleOutlined}
              accent="#7c3aed"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <WorkspaceMetricCard
                  label="Available Notes"
                  value={notes.length}
                  description="Notes that can be turned into flashcards."
                  icon={StyleOutlined}
                  accent="#7c3aed"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <WorkspaceMetricCard
                  label="Video Sources"
                  value={videoNoteIds.size}
                  description="Notes that can also include a video transcript."
                  icon={YouTube}
                  accent="#dc2626"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <WorkspaceMetricCard
                  label="Current View"
                  value={search ? `${filteredNotes.length} results` : 'All notes'}
                  description={search ? `Filtering by “${search}”.` : 'Choose any note to begin.'}
                  icon={Search}
                  accent="#0f766e"
                />
              </Grid>
            </Grid>

            <WorkspaceSection
              title="Choose a Note"
              description="Search your notes and open one to view existing flashcards or generate new ones."
            >
              <TextField
                fullWidth
                placeholder="Search notes"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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

              {filteredNotes.length === 0 ? (
                <WorkspaceEmptyState
                  icon={StyleOutlined}
                  title="No notes found"
                  description="Create notes first, or try a different search term to locate the right study source."
                  accent="#7c3aed"
                />
              ) : (
                <Grid container spacing={2}>
                  {filteredNotes.map((note) => (
                    <Grid item xs={12} sm={6} md={4} key={note.id}>
                      <NotePickerCard
                        note={note}
                        selected={selectedNote?.id === note.id}
                        hasVideo={videoNoteIds.has(note.id)}
                        onClick={() => handleSelectNote(note)}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </WorkspaceSection>
          </Stack>
        </Box>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snack.type} variant="filled" sx={{ borderRadius: 2 }}>
            {snack.text}
          </Alert>
        </Snackbar>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <Stack spacing={3}>
          <WorkspaceHero
            eyebrow="Active Recall"
            title={selectedNote.title || 'Selected Note'}
            description="Generate and review flashcards from this note, then refine the deck by difficulty and transcript inclusion."
            icon={StyleOutlined}
            accent="#7c3aed"
            action={(
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => {
                  setSelectedNote(null);
                  setFlashcards([]);
                }}
                sx={{ borderRadius: 3 }}
              >
                All Notes
              </Button>
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <WorkspaceMetricCard
                label="Cards"
                value={loading ? '...' : flashcards.length}
                description="Current flashcards for this note."
                icon={School}
                accent="#7c3aed"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <WorkspaceMetricCard
                label="Easy"
                value={difficultyCounts.easy}
                description="Quick recall items."
                icon={School}
                accent="#16a34a"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <WorkspaceMetricCard
                label="Medium"
                value={difficultyCounts.medium}
                description="Moderate challenge prompts."
                icon={School}
                accent="#d97706"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <WorkspaceMetricCard
                label="Hard"
                value={difficultyCounts.hard}
                description="Highest challenge prompts."
                icon={School}
                accent="#dc2626"
              />
            </Grid>
          </Grid>

          <WorkspaceSection
            title="Generate Flashcards"
            description="Refresh the deck at any time and optionally mix in content from the linked video transcript."
            action={(
              <Button
                variant="contained"
                startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
                onClick={handleGenerate}
                disabled={generating}
                sx={{
                  borderRadius: 3,
                  bgcolor: '#7c3aed',
                  '&:hover': { bgcolor: '#6d28d9' },
                }}
              >
                {generating ? 'Generating' : flashcards.length > 0 ? 'Regenerate' : 'Generate'}
              </Button>
            )}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                  {selectedNote.title || 'Selected note'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {getNotePreview(selectedNote, 160)}
                </Typography>
              </Box>
              {hasVideoForSelected && (
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={includeVideoNote}
                      onChange={(event) => setIncludeVideoNote(event.target.checked)}
                    />
                  }
                  label={(
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <YouTube fontSize="small" sx={{ color: '#dc2626' }} />
                      <Typography variant="body2">Include video transcript</Typography>
                    </Stack>
                  )}
                />
              )}
            </Stack>
            {generating && <LinearProgress sx={{ mt: 2, borderRadius: 999, height: 8 }} />}
          </WorkspaceSection>

          <WorkspaceSection
            title="Flashcard Deck"
            description="Flip cards to review answers and remove any item that does not fit the deck."
            action={flashcards.length > 0 ? (
              <Tooltip title="Regenerate deck">
                <IconButton size="small" onClick={handleGenerate} disabled={generating}>
                  <RefreshOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          >
            {loading ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
                  Loading flashcards...
                </Typography>
              </Box>
            ) : flashcards.length === 0 ? (
              <WorkspaceEmptyState
                icon={StyleOutlined}
                title="No flashcards yet"
                description="Generate a deck from this note to start reviewing with active recall."
                accent="#7c3aed"
              />
            ) : (
              <Grid container spacing={2.5}>
                {flashcards.map((card, index) => (
                  <Grid item xs={12} sm={6} md={4} key={card.id}>
                    <Box sx={{ position: 'relative' }}>
                      <FlashCard card={card} index={index} />
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(card.id);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255,255,255,0.88)',
                          backdropFilter: 'blur(6px)',
                          '&:hover': { bgcolor: '#fef2f2' },
                        }}
                      >
                        <DeleteOutline fontSize="small" sx={{ color: '#ef4444' }} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </WorkspaceSection>
        </Stack>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.type} variant="filled" sx={{ borderRadius: 2 }}>
          {snack.text}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
