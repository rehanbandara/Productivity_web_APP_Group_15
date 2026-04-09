import React, { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, Button, Chip, Typography, CircularProgress,
  Autocomplete, IconButton, Tooltip, Divider, Stack,
} from '@mui/material';
import {
  AutoAwesome, Delete, PushPin, PushPinOutlined,
  CheckCircleOutline, Sync, Close, Check,
} from '@mui/icons-material';
import { noteService } from '../../api/noteService';
import { tagService } from '../../api/tagService';
import { topicService } from '../../api/topicService';
import ErrorAlert from './ErrorAlert';
import ConfirmDialog from './ConfirmDialog';
import { validateNote } from '../../utils/validation';

// Colour palette for auto-created tags
const TAG_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];
const pickColor = (name) => TAG_COLORS[name.charCodeAt(0) % TAG_COLORS.length];

export default function NoteEditor({ noteId, topics: propTopics, tags: propTags, onSaved, onDeleted }) {
  const [note, setNote] = useState(null);
  const [topics, setTopics] = useState(propTopics || []);
  const [allTags, setAllTags] = useState(propTags || []);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Smart metadata state
  const [suggesting, setSuggesting] = useState(false);
  const [suggestedTopic, setSuggestedTopic] = useState('');   // suggested topic name
  const [suggestedTags, setSuggestedTags] = useState([]);     // suggested tag names not yet accepted

  const autosaveTimer = useRef(null);
  const titleInputRef = useRef(null);

  const validateCurrentNote = (currentNote) => {
    const nextErrors = validateNote({
      title: currentNote?.title || '',
      contentType: currentNote?.contentType || 'MARKDOWN',
      topicId: currentNote?.topic?.id ?? null,
    });
    setValidationErrors(nextErrors);
    return nextErrors;
  };

  // Load note
  useEffect(() => {
    if (noteId && noteId !== 'new') {
      setLoading(true);
      noteService.getById(noteId)
        .then((r) => {
          setNote({
            ...r.data,
            contentType: r.data.contentType || 'MARKDOWN',
          });
          setValidationErrors({});
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setNote({ title: '', content: '', contentType: 'MARKDOWN', topic: null, tags: [] });
      setValidationErrors({});
    }
  }, [noteId]);

  // Keep local topics/tags fresh if parent refreshes
  useEffect(() => { if (propTopics) setTopics(propTopics); }, [propTopics]);
  useEffect(() => { if (propTags) setAllTags(propTags); }, [propTags]);

  useEffect(() => () => clearTimeout(autosaveTimer.current), []);

  // ── Autosave ──────────────────────────────────────────────────
  const scheduleAutosave = (content) => {
    setSaveStatus('idle');
    clearTimeout(autosaveTimer.current);
    if (noteId && noteId !== 'new') {
      autosaveTimer.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          await noteService.autoSave(noteId, content);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch { setSaveStatus('idle'); }
      }, 2500);
    }
  };

  // ── Save note ─────────────────────────────────────────────────
  const handleSave = async () => {
    const nextErrors = validateCurrentNote(note);
    if (Object.keys(nextErrors).length > 0) {
      titleInputRef.current?.focus();
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        title: note.title,
        content: note.content,
        contentType: note.contentType || 'MARKDOWN',
        topicId: note.topic?.id || null,
      };
      let res;
      if (noteId && noteId !== 'new') {
        res = await noteService.update(noteId, payload);
      } else {
        res = await noteService.create(payload);
      }
      setNote(res.data);
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await noteService.delete(noteId);
      onDeleted?.();
    } catch (err) { setError(err.message); }
    finally { setDeleting(false); setDeleteConfirm(false); }
  };

  // ── Pin ───────────────────────────────────────────────────────
  const handlePin = async () => {
    try {
      const r = await noteService.togglePin(noteId);
      setNote(r.data);
    } catch (err) { setError(err.message); }
  };

  // ── Tags: attach existing ─────────────────────────────────────
  const handleAttachTag = async (tagId) => {
    try {
      const r = await noteService.attachTag(noteId, tagId);
      setNote(r.data);
    } catch (err) { setError(err.message); }
  };

  // ── Tags: remove ─────────────────────────────────────────────
  const handleRemoveTag = async (tagId) => {
    try {
      const r = await noteService.removeTag(noteId, tagId);
      setNote(r.data);
    } catch (err) { setError(err.message); }
  };

  // ── AI: suggest topic + tags ──────────────────────────────────
  const handleSuggest = async () => {
    if (!note?.content?.trim() && !note?.title?.trim()) return;
    setSuggesting(true);
    setSuggestedTopic('');
    setSuggestedTags([]);
    try {
      const r = await noteService.suggestMetadata(note.title || '', note.content || '');
      const { topicName, tags: tagNames } = r.data;

      // Suggested topic (only show if not already set)
      if (topicName && !note.topic) {
        setSuggestedTopic(topicName);
      }

      // Filter out tags already attached
      const existingTagNames = (note.tags || []).map((t) => t.name.toLowerCase());
      const newSuggested = (tagNames || []).filter(
        (n) => !existingTagNames.includes(n.toLowerCase())
      );
      setSuggestedTags(newSuggested);
    } catch (err) {
      setError('Could not generate suggestions. Please try again.');
    } finally {
      setSuggesting(false);
    }
  };

  // ── Accept suggested topic ────────────────────────────────────
  const handleAcceptTopic = async () => {
    if (!suggestedTopic) return;
    // Find existing topic or create new one
    let topic = topics.find((t) => t.name.toLowerCase() === suggestedTopic.toLowerCase());
    if (!topic) {
      try {
        const r = await topicService.create({ name: suggestedTopic, color: '#6366f1' });
        topic = r.data;
        setTopics((prev) => [...prev, topic]);
      } catch {
        // Topic may already exist with a different case — try to find it again
        const fresh = await topicService.getAll();
        setTopics(fresh.data);
        topic = fresh.data.find((t) => t.name.toLowerCase() === suggestedTopic.toLowerCase());
        if (!topic) { setError('Could not create topic.'); return; }
      }
    }
    setNote((prev) => ({ ...prev, topic }));
    setSuggestedTopic('');
  };

  // ── Accept suggested tag ──────────────────────────────────────
  const handleAcceptTag = async (tagName) => {
    if (noteId === 'new') {
      // Can't attach to unsaved note — just remove from suggestions silently
      setSuggestedTags((prev) => prev.filter((n) => n !== tagName));
      return;
    }
    setSuggestedTags((prev) => prev.filter((n) => n !== tagName));
    let tag = allTags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
    try {
      if (!tag) {
        const r = await tagService.create({ name: tagName, color: pickColor(tagName) });
        tag = r.data;
        setAllTags((prev) => [...prev, tag]);
      }
      const r = await noteService.attachTag(noteId, tag.id);
      setNote(r.data);
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Dismiss suggested tag ─────────────────────────────────────
  const dismissTag = (tagName) => setSuggestedTags((prev) => prev.filter((n) => n !== tagName));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }
  if (!note) return null;

  const isNew = !noteId || noteId === 'new';
  const attachedTagIds = new Set((note.tags || []).map((t) => t.id));
  const availableTags = allTags.filter((t) => !attachedTagIds.has(t.id));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <ErrorAlert error={error} onClose={() => setError('')} />

      {/* ── Header bar ─────────────────────────────────────── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        mb: 2, flexWrap: 'wrap', gap: 1,
      }}>
        {/* Save status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {saveStatus === 'saving' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Sync sx={{ fontSize: 14, color: '#94a3b8', animation: 'spin 1s linear infinite',
                '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Saving…</Typography>
            </Box>
          )}
          {saveStatus === 'saved' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircleOutline sx={{ fontSize: 14, color: '#10b981' }} />
              <Typography variant="caption" sx={{ color: '#10b981' }}>Saved</Typography>
            </Box>
          )}
        </Box>

        {/* Actions */}
        {!isNew && (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={note.isPinned ? 'Unpin' : 'Pin'}>
              <IconButton size="small" onClick={handlePin}
                sx={{ color: note.isPinned ? '#f59e0b' : '#94a3b8', '&:hover': { bgcolor: '#fef3c7' } }}>
                {note.isPinned ? <PushPin sx={{ fontSize: 18 }} /> : <PushPinOutlined sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete note">
              <IconButton size="small" onClick={() => setDeleteConfirm(true)}
                sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#fee2e2', color: '#ef4444' } }}>
                <Delete sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>

      {/* ── Title ──────────────────────────────────────────── */}
      <TextField
        placeholder="Note title…"
        value={note.title}
        inputRef={titleInputRef}
        onChange={(e) => {
          const nextNote = { ...note, title: e.target.value };
          setNote(nextNote);
          validateCurrentNote(nextNote);
        }}
        onBlur={() => validateCurrentNote(note)}
        error={!!validationErrors.title}
        helperText={validationErrors.title || `${note.title.length} / 30 characters`}
        fullWidth
        required
        variant="standard"
        inputProps={{ maxLength: 30 }}
        sx={{
          mb: 2,
          '& .MuiInput-input': { fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', py: 0.5 },
          '& .MuiInput-underline:before': { borderBottomColor: '#e2e8f0' },
          '& .MuiInput-underline:hover:before': { borderBottomColor: '#c7d2fe' },
          '& .MuiInput-underline:after': { borderBottomColor: '#6366f1' },
        }}
      />

      {/* ── Topic selector ─────────────────────────────────── */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
          <Typography variant="caption" fontWeight={700} sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.68rem' }}>
            Topic
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Autocomplete
            size="small"
            options={topics}
            getOptionLabel={(o) => o.name}
            value={note.topic || null}
            onChange={(_, newVal) => setNote((prev) => ({ ...prev, topic: newVal }))}
            renderOption={(props, option) => (
              <Box {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: option.color || '#6366f1', flexShrink: 0 }} />
                {option.name}
              </Box>
            )}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select or type a topic…" />
            )}
            sx={{ flex: 1 }}
          />
          <Tooltip title="AI suggest topic & tags from note content">
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={suggesting ? <CircularProgress size={12} /> : <AutoAwesome sx={{ fontSize: 14 }} />}
                onClick={handleSuggest}
                disabled={suggesting || (!note.title?.trim() && !note.content?.trim())}
                sx={{
                  textTransform: 'none', fontSize: 12, fontWeight: 600,
                  borderColor: '#c7d2fe', color: '#6366f1', whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: '#f0f4ff', borderColor: '#6366f1' },
                }}
              >
                {suggesting ? 'Thinking…' : 'AI Suggest'}
              </Button>
            </span>
          </Tooltip>
        </Box>

        {/* Suggested topic banner */}
        {suggestedTopic && (
          <Box sx={{
            mt: 1, px: 1.5, py: 1, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <AutoAwesome sx={{ fontSize: 14, color: '#10b981' }} />
            <Typography variant="caption" sx={{ color: '#065f46', flex: 1, fontWeight: 600 }}>
              Suggested topic: <strong>{suggestedTopic}</strong>
            </Typography>
            <Button size="small" onClick={handleAcceptTopic}
              sx={{ textTransform: 'none', fontSize: 11, color: '#10b981', fontWeight: 700, minWidth: 0, px: 1 }}>
              Use
            </Button>
            <IconButton size="small" onClick={() => setSuggestedTopic('')} sx={{ p: 0.25 }}>
              <Close sx={{ fontSize: 13, color: '#94a3b8' }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* ── Content ────────────────────────────────────────── */}
      <TextField
        placeholder="Start writing your note…"
        value={note.content}
        onChange={(e) => {
          setNote((prev) => ({ ...prev, content: e.target.value }));
          scheduleAutosave(e.target.value);
        }}
        multiline
        minRows={12}
        fullWidth
        variant="outlined"
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': { bgcolor: '#fafafa', fontSize: '0.9rem', lineHeight: 1.7 },
        }}
      />

      {/* ── Tags section ───────────────────────────────────── */}
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" fontWeight={700} sx={{
          color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5,
          fontSize: '0.68rem', display: 'block', mb: 1,
        }}>
          Tags
        </Typography>

        {/* Attached tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
          {(note.tags || []).map((tag) => (
            <Chip
              key={tag.id}
              label={`#${tag.name}`}
              size="small"
              onDelete={isNew ? undefined : () => handleRemoveTag(tag.id)}
              sx={{
                height: 24, fontSize: '0.75rem', fontWeight: 600,
                bgcolor: `${tag.color || '#6366f1'}15`,
                color: tag.color || '#6366f1',
                border: `1px solid ${tag.color || '#6366f1'}30`,
                '& .MuiChip-deleteIcon': { color: tag.color || '#6366f1', fontSize: 14 },
              }}
            />
          ))}

          {/* Add existing tag */}
          {!isNew && availableTags.length > 0 && (
            <Autocomplete
              size="small"
              options={availableTags}
              getOptionLabel={(o) => o.name}
              onChange={(_, val) => { if (val) handleAttachTag(val.id); }}
              value={null}
              blurOnSelect
              sx={{ width: 160 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="+ Add tag"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': { fontSize: 12, height: 28, py: '2px' },
                  }}
                />
              )}
            />
          )}

          {isNew && (
            <Typography variant="caption" sx={{ color: '#94a3b8', alignSelf: 'center', fontSize: '0.72rem' }}>
              Save note first to add tags
            </Typography>
          )}
        </Box>

        {/* AI-suggested tags */}
        {suggestedTags.length > 0 && (
          <Box sx={{
            p: 1.5, bgcolor: '#faf5ff', border: '1px solid #e9d5ff',
            borderRadius: 1.5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <AutoAwesome sx={{ fontSize: 13, color: '#8b5cf6' }} />
              <Typography variant="caption" fontWeight={700} sx={{ color: '#6d28d9', fontSize: '0.7rem' }}>
                AI suggested tags {isNew ? '(save note first to apply)' : '— click ✓ to add'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {suggestedTags.map((tagName) => (
                <Chip
                  key={tagName}
                  label={`#${tagName}`}
                  size="small"
                  icon={isNew ? undefined : <Check sx={{ fontSize: 13, color: '#8b5cf6 !important' }} />}
                  onDelete={() => dismissTag(tagName)}
                  onClick={isNew ? undefined : () => handleAcceptTag(tagName)}
                  deleteIcon={<Close sx={{ fontSize: 12 }} />}
                  sx={{
                    height: 24, fontSize: '0.73rem', fontWeight: 600,
                    bgcolor: '#ede9fe', color: '#6d28d9',
                    border: '1px solid #c4b5fd',
                    cursor: isNew ? 'default' : 'pointer',
                    '& .MuiChip-deleteIcon': { color: '#a78bfa' },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Save button ─────────────────────────────────────── */}
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving}
        sx={{
          bgcolor: '#6366f1', fontWeight: 700, textTransform: 'none',
          fontSize: 14, py: 1.25, borderRadius: 1.5,
          '&:hover': { bgcolor: '#4f46e5' },
        }}
      >
        {saving ? 'Saving…' : isNew ? 'Create Note' : 'Save Changes'}
      </Button>

      <ConfirmDialog
        open={deleteConfirm}
        title="Delete Note"
        message="Are you sure you want to delete this note? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
        loading={deleting}
      />
    </Box>
  );
}