//no
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Add,
  ArrowForward,
  ArticleOutlined,
  AutoAwesomeOutlined,
  FolderOutlined,
  LabelOutlined,
  PushPin,
  QuizOutlined,
  StyleOutlined,
  YouTube,
} from '@mui/icons-material';
import { noteService } from '../api/noteService';
import { tagService } from '../api/tagService';
import { topicService } from '../api/topicService';
import MainLayout from '../layouts/MainLayout';
import ErrorAlert from '../components/notes-chamod/ErrorAlert';
import {
  WorkspaceEmptyState,
  WorkspaceHero,
  WorkspaceMetricCard,
  WorkspaceSection,
} from '../components/workspace/WorkspaceChrome';
import { formatRelativeTime, getNotePreview } from '../utils/noteDisplay';

const TOOL_LINKS = [
  {
    label: 'Notes',
    description: 'Write, filter, and organize your study material.',
    path: '/notes',
    accent: '#6366f1',
    icon: ArticleOutlined,
  },
  {
    label: 'Video Notes',
    description: 'Turn YouTube videos into structured notes.',
    path: '/video-notes',
    accent: '#dc2626',
    icon: YouTube,
  },
  {
    label: 'Flashcards',
    description: 'Generate quick recall cards from your notes.',
    path: '/flashcards',
    accent: '#7c3aed',
    icon: StyleOutlined,
  },
  {
    label: 'Quizzes',
    description: 'Test yourself with AI-generated questions.',
    path: '/quizzes',
    accent: '#0f766e',
    icon: QuizOutlined,
  },
];

function ToolLinkCard({ item, onClick }) {
  const Icon = item.icon;

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        border: '1px solid',
        borderColor: '#e2e8f0',
        p: 2,
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)',
          borderColor: `${item.accent}55`,
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            bgcolor: `${item.accent}16`,
            color: item.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 21 }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.25 }}>
            {item.label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {item.description}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function DashboardNoteRow({ note, onClick }) {
  const topicColor = note.topic?.color || '#6366f1';

  return (
    <Box
      onClick={onClick}
      sx={{
        px: 1.5,
        py: 1.75,
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        '&:hover': { bgcolor: '#f8fafc' },
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Box
          sx={{
            width: 10,
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
              mt: { xs: 0.5, sm: 1 },
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
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
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
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1,
            }}
          >
            {getNotePreview(note, 145)}
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
            {note.isPinned && (
              <Chip
                icon={<PushPin sx={{ fontSize: 15 }} />}
                label="Pinned"
                size="small"
                sx={{
                  height: 24,
                  bgcolor: '#fffbeb',
                  color: '#b45309',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  '& .MuiChip-icon': { color: '#f59e0b' },
                }}
              />
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function TopicTile({ topic, noteCount, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        border: '1px solid',
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        background: '#fff',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)',
          borderColor: `${topic.color || '#6366f1'}55`,
        },
      }}
    >
      <Box sx={{ height: 5, bgcolor: topic.color || '#6366f1' }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }} noWrap>
          {topic.name}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
        </Typography>
      </Box>
    </Box>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    Promise.all([
      noteService.getAll(),
      topicService.getAll(),
      tagService.getAll(),
    ])
      .then(([notesResponse, topicsResponse, tagsResponse]) => {
        setNotes(notesResponse.data);
        setTopics(topicsResponse.data);
        setTags(tagsResponse.data);
      })
      .catch((err) => setError(err.message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const pinnedNotes = useMemo(() => notes.filter((note) => note.isPinned).slice(0, 4), [notes]);
  const recentNotes = useMemo(() => notes.slice(0, 6), [notes]);
  const topicSummaries = useMemo(
    () => topics.slice(0, 6).map((topic) => ({
      ...topic,
      noteCount: notes.filter((note) => note.topic?.id === topic.id).length,
    })),
    [notes, topics]
  );

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <ErrorAlert error={error} onClose={() => setError('')} />

        <Stack spacing={3}>
          <WorkspaceHero
            eyebrow="Study Workspace"
            title="Everything in one view"
            description="Track your notes, resurface priority material, and jump into the AI study tools from one consistent dashboard."
            icon={AutoAwesomeOutlined}
            accent="#6366f1"
            action={(
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/notes/new')}
                sx={{
                  alignSelf: { xs: 'stretch', md: 'auto' },
                  px: 2.25,
                  py: 1.25,
                  borderRadius: 3,
                  bgcolor: '#4f46e5',
                  '&:hover': { bgcolor: '#4338ca' },
                }}
              >
                New Note
              </Button>
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <WorkspaceMetricCard
                label="Notes"
                value={loading ? '...' : notes.length}
                description="Total notes across your workspace."
                icon={ArticleOutlined}
                accent="#6366f1"
                onClick={() => navigate('/notes')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <WorkspaceMetricCard
                label="Pinned"
                value={loading ? '...' : pinnedNotes.length}
                description="Featured notes kept close at hand."
                icon={PushPin}
                accent="#f59e0b"
                onClick={() => navigate('/notes')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <WorkspaceMetricCard
                label="Topics"
                value={loading ? '...' : topics.length}
                description="Primary study lanes for your notes."
                icon={FolderOutlined}
                accent="#ea580c"
                onClick={() => navigate('/topics')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <WorkspaceMetricCard
                label="Tags"
                value={loading ? '...' : tags.length}
                description="Cross-cutting labels for fast filtering."
                icon={LabelOutlined}
                accent="#0f766e"
                onClick={() => navigate('/tags')}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <Stack spacing={3}>
                <WorkspaceSection
                  title="Recent Notes"
                  description="Pick up where you left off and jump straight back into editing."
                  action={(
                    <Button
                      size="small"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/notes')}
                      sx={{ textTransform: 'none' }}
                    >
                      View notes
                    </Button>
                  )}
                >
                  {loading ? (
                    <Stack spacing={1}>
                      {[1, 2, 3, 4].map((item) => (
                        <Skeleton key={item} variant="rounded" height={88} sx={{ borderRadius: 3 }} />
                      ))}
                    </Stack>
                  ) : recentNotes.length === 0 ? (
                    <WorkspaceEmptyState
                      icon={ArticleOutlined}
                      title="No notes yet"
                      description="Start a note to populate your dashboard and begin building the rest of the study workflow."
                      action={(
                        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/notes/new')}>
                          Create Note
                        </Button>
                      )}
                      accent="#6366f1"
                    />
                  ) : (
                    <Stack spacing={0.5}>
                      {recentNotes.map((note) => (
                        <DashboardNoteRow
                          key={note.id}
                          note={note}
                          onClick={() => navigate(`/notes/${note.id}`)}
                        />
                      ))}
                    </Stack>
                  )}
                </WorkspaceSection>

                <WorkspaceSection
                  title="Topic Map"
                  description="See where your notes are accumulating and open focused views from here."
                  action={(
                    <Button
                      size="small"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/topics')}
                      sx={{ textTransform: 'none' }}
                    >
                      Manage topics
                    </Button>
                  )}
                >
                  {loading ? (
                    <Grid container spacing={2}>
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item}>
                          <Skeleton variant="rounded" height={116} sx={{ borderRadius: 3 }} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : topicSummaries.length === 0 ? (
                    <WorkspaceEmptyState
                      icon={FolderOutlined}
                      title="No topics yet"
                      description="Create topics to group related notes into a clearer study structure."
                      action={(
                        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/topics')}>
                          Add Topic
                        </Button>
                      )}
                      accent="#ea580c"
                    />
                  ) : (
                    <Grid container spacing={2}>
                      {topicSummaries.map((topic) => (
                        <Grid item xs={12} sm={6} md={4} key={topic.id}>
                          <TopicTile
                            topic={topic}
                            noteCount={topic.noteCount}
                            onClick={() => navigate(`/notes?topicId=${topic.id}`)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </WorkspaceSection>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Stack spacing={3}>
                <WorkspaceSection
                  title="Learning Tools"
                  description="Move from notes into active recall and video-assisted study."
                >
                  <Stack spacing={1.25}>
                    {TOOL_LINKS.map((item) => (
                      <ToolLinkCard
                        key={item.label}
                        item={item}
                        onClick={() => navigate(item.path)}
                      />
                    ))}
                  </Stack>
                </WorkspaceSection>

                <WorkspaceSection
                  title="Pinned Notes"
                  description="High-priority material surfaced for faster return visits."
                >
                  {loading ? (
                    <Stack spacing={1.25}>
                      {[1, 2, 3].map((item) => (
                        <Skeleton key={item} variant="rounded" height={88} sx={{ borderRadius: 3 }} />
                      ))}
                    </Stack>
                  ) : pinnedNotes.length === 0 ? (
                    <WorkspaceEmptyState
                      icon={PushPin}
                      title="Nothing pinned yet"
                      description="Pin your most important notes from the notes workspace to keep them visible here."
                      accent="#f59e0b"
                    />
                  ) : (
                    <Stack spacing={1.25}>
                      {pinnedNotes.map((note) => (
                        <Box
                          key={note.id}
                          onClick={() => navigate(`/notes/${note.id}`)}
                          sx={{
                            cursor: 'pointer',
                            p: 2,
                            borderRadius: 3,
                            border: '1px solid #fde68a',
                            bgcolor: '#fffbeb',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 26px rgba(180, 83, 9, 0.12)',
                            },
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }} noWrap>
                            {note.title || 'Untitled note'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                            {getNotePreview(note, 90)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600 }}>
                            Updated {formatRelativeTime(note.updatedAt)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </WorkspaceSection>

                <WorkspaceSection
                  title="Popular Tags"
                  description="Open notes filtered by the labels you use most often."
                  action={(
                    <Button
                      size="small"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/tags')}
                      sx={{ textTransform: 'none' }}
                    >
                      Manage tags
                    </Button>
                  )}
                >
                  {loading ? (
                    <Skeleton variant="rounded" height={84} sx={{ borderRadius: 3 }} />
                  ) : tags.length === 0 ? (
                    <WorkspaceEmptyState
                      icon={LabelOutlined}
                      title="No tags yet"
                      description="Create tags to cut across topics and build faster filtered workflows."
                      accent="#0f766e"
                    />
                  ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {tags.slice(0, 14).map((tag) => (
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          onClick={() => navigate(`/notes?tagId=${tag.id}`)}
                          sx={{
                            height: 30,
                            bgcolor: `${tag.color || '#6366f1'}16`,
                            color: tag.color || '#6366f1',
                            border: `1px solid ${(tag.color || '#6366f1')}30`,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </WorkspaceSection>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </MainLayout>
  );
}
