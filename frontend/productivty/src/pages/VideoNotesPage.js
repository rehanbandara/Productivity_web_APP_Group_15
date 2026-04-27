import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Collapse,
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
  Add,
  ArticleOutlined,
  AutoAwesome,
  CheckCircleOutline,
  ContentCopy,
  DeleteOutline,
  ExpandLess,
  ExpandMore,
  PlayCircle,
  RefreshOutlined,
  YouTube,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { videoNoteService } from '../api/videoNoteService';
import { noteService } from '../api/noteService';
import {
  WorkspaceEmptyState,
  WorkspaceHero,
  WorkspaceMetricCard,
  WorkspaceSection,
} from '../components/workspace/WorkspaceChrome';
import { validateYouTubeUrl } from '../utils/validation';

const YOUTUBE_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

function extractVideoId(url) {
  const match = url.match(YOUTUBE_RE);
  return match ? match[1] : null;
}

function VideoCard({ note, videoNote, onDelete, onRefresh, onOpenNote }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const embedUrl = `https://www.youtube.com/embed/${videoNote.videoId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: '#e2e8f0',
        boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
      }}
    >
      <Box sx={{ position: 'relative', paddingTop: '42%', bgcolor: '#000' }}>
        <CardMedia
          component="iframe"
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 2.75 } }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                {note.title}
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<YouTube sx={{ fontSize: 14 }} />}
                  label="Video Note"
                  size="small"
                  sx={{
                    bgcolor: '#fff1f2',
                    color: '#dc2626',
                    fontWeight: 700,
                    '& .MuiChip-icon': { color: '#dc2626' },
                  }}
                />
                <Chip
                  icon={<AutoAwesome sx={{ fontSize: 14 }} />}
                  label="AI Generated"
                  size="small"
                  sx={{
                    bgcolor: '#eef2ff',
                    color: '#4338ca',
                    fontWeight: 700,
                    '& .MuiChip-icon': { color: '#6366f1' },
                  }}
                />
                {videoNote.fetchedAt && (
                  <Chip
                    label={new Date(videoNote.fetchedAt).toLocaleDateString()}
                    size="small"
                    sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 600 }}
                  />
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Open note">
                <IconButton size="small" onClick={() => onOpenNote(note.id)} sx={{ '&:hover': { bgcolor: '#eef2ff' } }}>
                  <ArticleOutlined fontSize="small" sx={{ color: '#6366f1' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy note content">
                <IconButton size="small" onClick={handleCopy}>
                  {copied
                    ? <CheckCircleOutline fontSize="small" color="success" />
                    : <ContentCopy fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh transcript">
                <IconButton size="small" onClick={() => onRefresh(note.id)}>
                  <RefreshOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete video note">
                <IconButton size="small" onClick={() => onDelete(note.id)}>
                  <DeleteOutline fontSize="small" sx={{ color: '#ef4444' }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {note.summary && (
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: '#f8fbff',
                border: '1px solid #dbeafe',
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  color: '#2563eb',
                  fontWeight: 700,
                  letterSpacing: 1,
                  fontSize: '0.68rem',
                  mb: 0.5,
                }}
              >
                AI Summary
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {note.summary}
              </Typography>
            </Box>
          )}

          <Box>
            <Button
              size="small"
              startIcon={<ArticleOutlined />}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setExpanded((prev) => !prev)}
              sx={{ textTransform: 'none', color: '#475569', mb: 1 }}
            >
              {expanded ? 'Hide generated note' : 'View generated note'}
            </Button>
            <Collapse in={expanded}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  maxHeight: 340,
                  overflow: 'auto',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button
                    size="small"
                    startIcon={copied ? <CheckCircleOutline /> : <ContentCopy />}
                    onClick={handleCopy}
                    sx={{ textTransform: 'none' }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.8,
                    fontFamily: 'monospace',
                    fontSize: 13,
                    color: '#334155',
                  }}
                >
                  {note.content}
                </Typography>
              </Box>
            </Collapse>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function VideoNotesPage() {
  const navigate = useNavigate();
  const urlInputRef = useRef(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState([]);
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const notesResponse = await noteService.getAll();
        const items = [];

        await Promise.all(
          notesResponse.data.map(async (note) => {
            try {
              const videoResponse = await videoNoteService.get(note.id);
              items.push({ note, videoNote: videoResponse.data });
            } catch (_) {
              // Ignore notes without video metadata.
            }
          })
        );

        setGeneratedItems(items);
      } catch (_) {
        // Keep the page usable even if the initial list fails.
      }
    })();
  }, []);

  const handleGenerate = async () => {
    const trimmed = youtubeUrl.trim();
    const validationError = validateYouTubeUrl(trimmed);

    if (validationError) {
      setUrlError(validationError);
      urlInputRef.current?.focus();
      return;
    }

    setUrlError('');
    setGenerating(true);
    try {
      const response = await videoNoteService.generateFromUrl(trimmed);
      const data = response.data;
      const newNote = {
        id: data.noteId,
        title: data.noteTitle,
        content: data.noteContent,
        summary: data.summary,
        createdAt: data.createdAt,
      };
      const newVideoNote = {
        id: data.videoNoteId,
        youtubeUrl: data.youtubeUrl,
        videoId: data.videoId,
        videoTitle: data.videoTitle,
        transcript: data.transcript,
        fetchedAt: data.createdAt,
      };

      setGeneratedItems((prev) => [{ note: newNote, videoNote: newVideoNote }, ...prev]);
      setYoutubeUrl('');
      setSnack({ open: true, type: 'success', text: `Note "${data.noteTitle}" created from video.` });
    } catch (err) {
      setSnack({
        open: true,
        type: 'error',
        text: err.response?.data?.message || 'Failed to generate note from video',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await videoNoteService.remove(noteId);
      setGeneratedItems((prev) => prev.filter((item) => item.note.id !== noteId));
      setSnack({ open: true, type: 'success', text: 'Video note deleted' });
    } catch (_) {
      setSnack({ open: true, type: 'error', text: 'Failed to delete video note' });
    }
  };

  const handleRefresh = async (noteId) => {
    try {
      const response = await videoNoteService.refreshTranscript(noteId);
      const videoNote = response.data;
      setGeneratedItems((prev) => prev.map((item) => (
        item.note.id === noteId
          ? { ...item, videoNote: { ...item.videoNote, transcript: videoNote.transcript, fetchedAt: videoNote.fetchedAt } }
          : item
      )));
      setSnack({ open: true, type: 'success', text: 'Transcript refreshed' });
    } catch (_) {
      setSnack({ open: true, type: 'error', text: 'Failed to refresh transcript' });
    }
  };

  const videoId = extractVideoId(youtubeUrl.trim());
  const summarizedCount = generatedItems.filter((item) => item.note.summary).length;
  const inputState = youtubeUrl.trim()
    ? videoId ? 'Valid link' : 'Needs review'
    : 'Waiting for link';

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <Stack spacing={3}>
          <WorkspaceHero
            eyebrow="AI Capture"
            title="Video Notes"
            description="Paste a YouTube URL and turn the transcript into an editable study note, summary, and reusable source for flashcards or quizzes."
            icon={YouTube}
            accent="#dc2626"
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <WorkspaceMetricCard
                label="Video Notes"
                value={generatedItems.length}
                description="Generated notes linked to videos."
                icon={YouTube}
                accent="#dc2626"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <WorkspaceMetricCard
                label="Summaries Ready"
                value={summarizedCount}
                description="Items that already include an AI summary."
                icon={AutoAwesome}
                accent="#6366f1"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <WorkspaceMetricCard
                label="Input Status"
                value={inputState}
                description={videoId ? `Video ID detected: ${videoId}` : 'Paste a supported YouTube link to begin.'}
                icon={PlayCircle}
                accent="#0f766e"
              />
            </Grid>
          </Grid>

          <WorkspaceSection
            title="Generate From YouTube"
            description="The AI workflow fetches the transcript, structures the content, and saves it as a note in your workspace."
          >
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
                <TextField
                  fullWidth
                  inputRef={urlInputRef}
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(event) => {
                    const nextUrl = event.target.value;
                    setYoutubeUrl(nextUrl);
                    if (urlError) {
                      setUrlError(validateYouTubeUrl(nextUrl));
                    }
                  }}
                  onBlur={() => setUrlError(validateYouTubeUrl(youtubeUrl))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !generating) {
                      handleGenerate();
                    }
                  }}
                  error={!!urlError}
                  helperText={urlError || (videoId ? `Video ID: ${videoId}` : ' ')}
                  disabled={generating}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <YouTube sx={{ color: '#dc2626', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: '#f8fafc',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleGenerate}
                  disabled={generating}
                  startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
                  sx={{
                    minWidth: { xs: '100%', md: 180 },
                    height: 56,
                    borderRadius: 3,
                    bgcolor: '#dc2626',
                    '&:hover': { bgcolor: '#b91c1c' },
                  }}
                >
                  {generating ? 'Generating' : 'Generate Note'}
                </Button>
              </Stack>

              {generating && (
                <Box>
                  <LinearProgress sx={{ borderRadius: 999, height: 8 }} />
                  <Typography variant="caption" sx={{ color: '#64748b', mt: 0.75, display: 'block' }}>
                    Fetching transcript and generating note content...
                  </Typography>
                </Box>
              )}

              <Grid container spacing={1.5}>
                {[
                  { step: '1', label: 'Paste URL', desc: 'Use any supported YouTube link.' },
                  { step: '2', label: 'AI Processes', desc: 'Transcript and note structure are generated.' },
                  { step: '3', label: 'Study Ready', desc: 'The note becomes editable and reusable elsewhere.' },
                ].map((item) => (
                  <Grid size={{ xs: 12, md: 4 }} key={item.step}>
                    <Box
                      sx={{
                        p: 1.75,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: '#e2e8f0',
                        bgcolor: '#fff',
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: '#eef2ff',
                            color: '#4338ca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {item.step}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {item.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {item.desc}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </WorkspaceSection>

          <WorkspaceSection
            title="Generated Video Notes"
            description="Reopen, refresh, or remove the notes already created from videos."
          >
            {generatedItems.length > 0 ? (
              <Stack spacing={2.5}>
                {generatedItems.map(({ note, videoNote }) => (
                  <VideoCard
                    key={note.id}
                    note={note}
                    videoNote={videoNote}
                    onDelete={handleDelete}
                    onRefresh={handleRefresh}
                    onOpenNote={(noteId) => navigate(`/notes/${noteId}`)}
                  />
                ))}
              </Stack>
            ) : !generating ? (
              <WorkspaceEmptyState
                icon={YouTube}
                title="No video notes yet"
                description="Paste a YouTube URL above and let the AI create a structured study note for you."
                action={(
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => urlInputRef.current?.focus()}
                  >
                    Add Your First Video
                  </Button>
                )}
                accent="#dc2626"
              />
            ) : null}
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