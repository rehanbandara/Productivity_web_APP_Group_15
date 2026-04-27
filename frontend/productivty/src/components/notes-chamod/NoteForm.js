import React, { useState } from 'react';
import {
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Button,
  Stack,
  Box,
  FormHelperText,
  InputAdornment,
  FormLabel,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CodeIcon from '@mui/icons-material/Code';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { validateNote } from '../../utils/validation';

export default function NoteForm({
  initialValues,
  topics,
  onSubmit,
  onCancel,
  loading,
}) {
  const [values, setValues] = useState({
    title: initialValues?.title || '',
    content: initialValues?.content || '',
    contentType: initialValues?.contentType || 'MARKDOWN',
    topicId: initialValues?.topic?.id || null,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (event) => {
    const newValue = event.target?.value ?? event;
    const newValues = { ...values, [field]: newValue };
    setValues(newValues);
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateNote(newValues));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateNote(values));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);
    const validationErrors = validateNote(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit(values);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField
        label="Note Title"
        value={values.title}
        onChange={handleChange('title')}
        onBlur={handleBlur('title')}
        error={touched.title && !!errors.title}
        helperText={
          (touched.title && errors.title) || ${values.title.length} / 100 characters
        }
        inputProps={{ maxLength: 100 }}
        required
        fullWidth
        InputProps={{
          endAdornment: touched.title && errors.title && (
            <InputAdornment position="end">
              <ErrorOutlineIcon sx={{ color: '#ef4444', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      <Box>
        <FormLabel sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#0f172a' }}>
          Content Type
        </FormLabel>
        <ToggleButtonGroup
          value={values.contentType}
          exclusive
          onChange={(e, newValue) => {
            if (newValue) handleChange('contentType')({ target: { value: newValue } });
          }}
          fullWidth
          sx={{ mb: 1 }}
        >
          <ToggleButton
            value="MARKDOWN"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-selected': { backgroundColor: '#6366f1', color: '#fff' },
            }}
          >
            <TextFieldsIcon sx={{ mr: 0.5, fontSize: 18 }} />
            Markdown
          </ToggleButton>
          <ToggleButton
            value="HTML"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-selected': { backgroundColor: '#6366f1', color: '#fff' },
            }}
          >
            <CodeIcon sx={{ mr: 0.5, fontSize: 18 }} />
            HTML
          </ToggleButton>
        </ToggleButtonGroup>
        {touched.contentType && errors.contentType && (
          <FormHelperText error sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ErrorOutlineIcon sx={{ fontSize: 16 }} />
            {errors.contentType}
          </FormHelperText>
        )}
      </Box>

      <Autocomplete
        options={topics}
        getOptionLabel={(option) => option.name}
        value={topics.find((t) => t.id === values.topicId) || null}
        onChange={(e, newValue) => {
          const topicId = newValue?.id || '';
          const newValues = { ...values, topicId };
          setValues(newValues);
          setTouched((prev) => ({ ...prev, topicId: true }));
          setErrors(validateNote(newValues));
        }}
        renderOption={(props, option) => (
          <Box
            {...props}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: option.color || '#cbd5e1',
              }}
            />
            {option.name}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Topic (optional)"
            error={touched.topicId && !!errors.topicId}
            helperText={touched.topicId && errors.topicId}
          />
        )}
      />

      <TextField
        label="Note Content"
        value={values.content}
        onChange={handleChange('content')}
        onBlur={handleBlur('content')}
        multiline
        minRows={12}
        fullWidth
        placeholder="Start typing your note here..."
        sx={{
          '& .MuiInputBase-input': {
            fontFamily: values.contentType === 'MARKDOWN' ? '"Fira Code", monospace' : 'inherit',
            fontSize: '0.9rem',
          },
        }}
      />

      <Stack direction="row" gap={1} sx={{ pt: 1 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || hasErrors}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Saving...' : 'Save Note'}
        </Button>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}