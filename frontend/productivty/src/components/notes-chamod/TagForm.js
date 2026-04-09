import React, { useState } from 'react';
import {
  TextField,
  Button,
  Stack,
  Box,
  FormHelperText,
  InputAdornment,
  FormLabel,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { validateTag } from '../../utils/validation';

export default function TagForm({
  initialValues,
  onSubmit,
  onCancel,
  loading,
}) {
  const [values, setValues] = useState({
    name: initialValues?.name || '',
    color: initialValues?.color || '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (event) => {
    const newValues = { ...values, [field]: event.target.value };
    setValues(newValues);
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateTag(newValues));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);
    const validationErrors = validateTag(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit(values);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField
        label="Tag Name"
        value={values.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        error={touched.name && !!errors.name}
        helperText={
          (touched.name && errors.name) || `${values.name.length} / 10 characters`
        }
        inputProps={{ maxLength: 10 }}
        required
        fullWidth
      />

      <Box>
        <FormLabel sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#0f172a' }}>
          Tag Color
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

      <Stack direction="row" gap={1} sx={{ pt: 1 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || hasErrors}
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Saving...' : 'Save Tag'}
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
