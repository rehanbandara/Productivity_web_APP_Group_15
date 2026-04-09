import React, { useState } from 'react';
import {
  TextField,
  Button,
  Stack,
  Box,
  FormLabel,
} from '@mui/material';
import { validateTopic } from '../../utils/validation';

export default function TopicForm({
  initialValues,
  onSubmit,
  onCancel,
  loading,
}) {
  const [values, setValues] = useState({
    name: initialValues?.name || '',
    color: initialValues?.color || '',
    description: initialValues?.description || '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (event) => {
    const newValues = { ...values, [field]: event.target.value };
    setValues(newValues);
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateTopic(newValues));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateTopic(values));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);
    const validationErrors = validateTopic(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit(values);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField
        label="Topic Name"
        value={values.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        error={touched.name && !!errors.name}
        helperText={
          (touched.name && errors.name) || `${values.name.length} / 40 characters`
        }
        inputProps={{ maxLength: 40 }}
        required
        fullWidth
      />

      <Box>
        <FormLabel sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#0f172a' }}>
          Topic Color
        </FormLabel>
        <Stack direction="row" gap={1} alignItems="flex-start">
          <TextField
            label="Hex Color"
            value={values.color}
            onChange={handleChange('color')}
            onBlur={handleBlur('color')}
            error={touched.color && !!errors.color}
            helperText={
              (touched.color && errors.color) || 'e.g., #6366f1'
            }
            placeholder="#6366f1"
            sx={{ flex: 1 }}
          />
          <Box
            component="input"
            type="color"
            value={values.color || '#6366f1'}
            onChange={(e) => handleChange('color')({ target: { value: e.target.value } })}
            sx={{
              height: 40,
              width: 60,
              cursor: 'pointer',
              border: '2px solid #e2e8f0',
              borderRadius: 1,
              mt: 0.5,
            }}
          />
        </Stack>
      </Box>

      <TextField
        label="Description"
        value={values.description}
        onChange={handleChange('description')}
        onBlur={handleBlur('description')}
        error={touched.description && !!errors.description}
        helperText={
          (touched.description && errors.description) || `${values.description.length} / 500 characters`
        }
        multiline
        minRows={3}
        fullWidth
        placeholder="Describe this topic..."
        slotProps={{
          input: { maxLength: 500 },
        }}
      />

      <Stack direction="row" gap={1} sx={{ pt: 1 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || hasErrors}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Saving...' : 'Save Topic'}
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