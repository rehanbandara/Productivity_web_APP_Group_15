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
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  AutoAwesome,
  Cancel,
  CheckCircle,
  DeleteOutline,
  EmojiEvents,
  QuizOutlined,
  RefreshOutlined,
  RestartAlt,
  Search,
  YouTube,
} from '@mui/icons-material';
import MainLayout from '../layouts/MainLayout';
import { noteService } from '../api/noteService';
import { quizService } from '../api/quizService';
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

function QuestionCard({ question, index, submitted, userAnswer, onAnswer }) {
  const config = DIFFICULTY_CONFIG[question.difficulty] || DIFFICULTY_CONFIG.MEDIUM;
  const isCorrect = submitted && userAnswer === question.correctAnswer;
  const isWrong = submitted && userAnswer && userAnswer !== question.correctAnswer;

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '1.5px solid',
        borderColor: submitted
          ? isCorrect
            ? '#86efac'
            : isWrong
              ? '#fca5a5'
              : '#e2e8f0'
          : '#e2e8f0',
        bgcolor: submitted
          ? isCorrect
            ? '#f0fdf4'
            : isWrong
              ? '#fef2f2'
              : '#fff'
          : '#fff',
        boxShadow: '0 16px 34px rgba(15, 23, 42, 0.05)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.75 } }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  bgcolor: '#eef2ff',
                  color: '#4338ca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                }}
              >
                {index + 1}
              </Box>
              <Chip
                label={config.label}
                size="small"
                sx={{
                  bgcolor: config.bg,
                  color: config.accent,
                  border: `1px solid ${config.border}`,
                  fontWeight: 700,
                }}
              />
            </Stack>
            {submitted && (
              isCorrect
                ? <CheckCircle sx={{ color: '#16a34a' }} />
                : isWrong
                  ? <Cancel sx={{ color: '#dc2626' }} />
                  : null
            )}
          </Stack>

          <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.65 }}>
            {question.question}
          </Typography>

          <RadioGroup
            value={userAnswer || ''}
            onChange={(event) => {
              if (!submitted) {
                onAnswer(question.id, event.target.value);
              }
            }}
          >
            <Stack spacing={1}>
              {question.options.map((option) => {
                const isThisCorrect = submitted && option === question.correctAnswer;
                const isThisWrong = submitted && option === userAnswer && option !== question.correctAnswer;

                return (
                  <Box
                    key={option}
                    sx={{
                      border: '1.5px solid',
                      borderColor: isThisCorrect ? '#86efac' : isThisWrong ? '#fca5a5' : '#e2e8f0',
                      borderRadius: 3,
                      bgcolor: isThisCorrect ? '#f0fdf4' : isThisWrong ? '#fef2f2' : '#fff',
                      px: 1.25,
                      py: 0.4,
                      transition: 'background-color 0.2s ease, border-color 0.2s ease',
                      '&:hover': submitted ? undefined : { borderColor: '#818cf8', bgcolor: '#f8fbff' },
                    }}
                  >
                    <FormControlLabel
                      value={option}
                      control={<Radio size="small" disabled={submitted} />}
                      label={<Typography variant="body2">{option}</Typography>}
                      sx={{ m: 0, width: '100%' }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </RadioGroup>

          {submitted && question.explanation && (
            <Box
              sx={{
                p: 1.75,
                borderRadius: 3,
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
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
                Explanation
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                {question.explanation}
              </Typography>
            </Box>
          )}
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
        borderColor: selected ? '#0d9488' : '#e2e8f0',
        bgcolor: selected ? '#ecfeff' : '#fff',
        p: 2.25,
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 34px rgba(15, 23, 42, 0.08)',
          borderColor: '#0d9488',
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
                bgcolor: '#ecfeff',
                color: '#0f766e',
                fontWeight: 700,
                '& .MuiChip-icon': { color: '#0d9488' },
              }}
            />
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

function ScoreSummary({ score, total, onRetry, onBack }) {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const summary = percent >= 80
    ? { title: 'Excellent work', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' }
    : percent >= 60
      ? { title: 'Good progress', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' }
      : { title: 'Keep practicing', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' };

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: summary.border,
        bgcolor: summary.bg,
        boxShadow: '0 16px 34px rgba(15, 23, 42, 0.05)',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={1.75} alignItems="center" textAlign="center">
          <EmojiEvents sx={{ fontSize: 52, color: '#f59e0b' }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {score} / {total}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: summary.color }}>
            {summary.title}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              width: '100%',
              maxWidth: 320,
              height: 10,
              borderRadius: 999,
              bgcolor: '#fff',
              '& .MuiLinearProgress-bar': { bgcolor: summary.color },
            }}
          />
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 360 }}>
            You answered {score} out of {total} questions correctly, which is {percent}% accuracy.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button variant="outlined" startIcon={<RestartAlt />} onClick={onRetry}>
              Retry Quiz
            </Button>
            <Button variant="contained" startIcon={<ArrowBack />} onClick={onBack} sx={{ bgcolor: '#0f766e', '&:hover': { bgcolor: '#115e59' } }}>
              Back to Notes
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function QuizzesPage() {
  const [notes, setNotes] = useState([]);
  const [videoNoteIds, setVideoNoteIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [includeVideoNote, setIncludeVideoNote] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
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

  const loadQuestions = useCallback(async (noteId) => {
    setLoading(true);
    try {
      const response = await quizService.getAll(noteId);
      setQuestions(response.data);
    } catch (_) {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setIncludeVideoNote(false);
    setAnswers({});
    setSubmitted(false);
    loadQuestions(note.id);
  };

  const handleGenerate = async () => {
    if (!selectedNote) {
      return;
    }

    setGenerating(true);
    setAnswers({});
    setSubmitted(false);
    try {
      const response = await quizService.generate(selectedNote.id, includeVideoNote);
      setQuestions(response.data);
      setSnack({ open: true, type: 'success', text: `Generated ${response.data.length} quiz questions.` });
    } catch (err) {
      setSnack({
        open: true,
        type: 'error',
        text: err.response?.data?.message || 'Quiz generation failed',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const handleDelete = async (questionId) => {
    try {
      await quizService.delete(selectedNote.id, questionId);
      setQuestions((prev) => prev.filter((question) => question.id !== questionId));
      setSnack({ open: true, type: 'success', text: 'Question deleted' });
    } catch (_) {
      setSnack({ open: true, type: 'error', text: 'Failed to delete question' });
    }
  };

  const filteredNotes = useMemo(
    () => notes.filter((note) => note.title.toLowerCase().includes(search.toLowerCase())),
    [notes, search]
  );
  const hasVideoForSelected = selectedNote && videoNoteIds.has(selectedNote.id);
  const answeredCount = Object.keys(answers).length;
  const score = submitted
    ? questions.filter((question) => answers[question.id] === question.correctAnswer).length
    : 0;
  const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (!selectedNote) {
    return (
      <MainLayout>
        <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
          <Stack spacing={3}>
            <WorkspaceHero
              eyebrow="Assessment"
              title="Quizzes"
              description="Choose a note, generate AI questions, and review the answers in the same workspace style used everywhere else."
              icon={QuizOutlined}
              accent="#0f766e"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <WorkspaceMetricCard
                  label="Available Notes"
                  value={notes.length}
                  description="Notes that can become quiz sources."
                  icon={QuizOutlined}
                  accent="#0f766e"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <WorkspaceMetricCard
                  label="Video Sources"
                  value={videoNoteIds.size}
                  description="Notes that can include transcript context."
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
                  accent="#ea580c"
                />
              </Grid>
            </Grid>

            <WorkspaceSection
              title="Choose a Note"
              description="Search your notes and open one to review or generate quiz questions."
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
                  icon={QuizOutlined}
                  title="No notes found"
                  description="Create notes first, or adjust your search to find the right quiz source."
                  accent="#0f766e"
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
            eyebrow="Assessment"
            title={selectedNote.title || 'Selected Note'}
            description="Generate a quiz from this note, answer each question, and review the explanations with the same clean page structure used elsewhere."
            icon={QuizOutlined}
            accent="#0f766e"
            action={(
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => {
                  setSelectedNote(null);
                  setQuestions([]);
                  setAnswers({});
                  setSubmitted(false);
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
                label="Questions"
                value={loading ? '...' : questions.length}
                description="Current quiz size."
                icon={QuizOutlined}
                accent="#0f766e"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <WorkspaceMetricCard
                label="Answered"
                value={`${answeredCount}/${questions.length || 0}`}
                description="Questions you have attempted."
                icon={CheckCircle}
                accent="#2563eb"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <WorkspaceMetricCard
                label="Score"
                value={submitted ? `${accuracy}%` : 'Not graded'}
                description={submitted ? `${score} correct answers` : 'Submit to grade the quiz.'}
                icon={EmojiEvents}
                accent="#f59e0b"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <WorkspaceMetricCard
                label="Source Mode"
                value={hasVideoForSelected && includeVideoNote ? 'Note + Video' : 'Note only'}
                description={hasVideoForSelected
                  ? 'You can toggle transcript context in the generator.'
                  : 'No linked video transcript is available.'}
                icon={YouTube}
                accent="#dc2626"
              />
            </Grid>
          </Grid>

          <WorkspaceSection
            title="Generate Quiz"
            description="Refresh the question set at any time and optionally include the transcript from the linked video note."
            action={(
              <Button
                variant="contained"
                startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
                onClick={handleGenerate}
                disabled={generating}
                sx={{
                  borderRadius: 3,
                  bgcolor: '#0f766e',
                  '&:hover': { bgcolor: '#115e59' },
                }}
              >
                {generating ? 'Generating' : questions.length > 0 ? 'Regenerate' : 'Generate'}
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
                  control={(
                    <Checkbox
                      size="small"
                      checked={includeVideoNote}
                      onChange={(event) => setIncludeVideoNote(event.target.checked)}
                    />
                  )}
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

          {submitted && questions.length > 0 && (
            <ScoreSummary
              score={score}
              total={questions.length}
              onRetry={handleRetry}
              onBack={() => {
                setSelectedNote(null);
                setQuestions([]);
                setAnswers({});
                setSubmitted(false);
              }}
            />
          )}

          <WorkspaceSection
            title="Quiz Questions"
            description="Answer each question, then submit the quiz to reveal the explanations."
            action={questions.length > 0 && !submitted ? (
              <Tooltip title="Regenerate questions">
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
                  Loading questions...
                </Typography>
              </Box>
            ) : questions.length === 0 ? (
              <WorkspaceEmptyState
                icon={QuizOutlined}
                title="No quiz questions yet"
                description="Generate a quiz from this note to start testing yourself."
                accent="#0f766e"
              />
            ) : (
              <Stack spacing={2.5}>
                {questions.map((question, index) => (
                  <Box key={question.id} sx={{ position: 'relative' }}>
                    <QuestionCard
                      question={question}
                      index={index}
                      submitted={submitted}
                      userAnswer={answers[question.id]}
                      onAnswer={handleAnswer}
                    />
                    {!submitted && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(question.id)}
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
                    )}
                  </Box>
                ))}

                {!submitted && (
                  <Box sx={{ textAlign: 'center', pt: 1 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleSubmit}
                      disabled={answeredCount === 0}
                      sx={{
                        px: 5,
                        borderRadius: 3,
                        bgcolor: '#0f766e',
                        '&:hover': { bgcolor: '#115e59' },
                      }}
                    >
                      Submit Quiz ({answeredCount}/{questions.length} answered)
                    </Button>
                  </Box>
                )}
              </Stack>
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
