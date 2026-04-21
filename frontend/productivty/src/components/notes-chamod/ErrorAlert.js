import React from 'react';
import { Alert, Collapse } from '@mui/material';

export default function ErrorAlert({ error, onClose }) {
  return (
    <Collapse in={!!error}>
      <Alert onClose={onClose} severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    </Collapse>
  );
}
