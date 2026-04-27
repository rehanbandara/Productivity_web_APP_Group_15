import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogContent sx={{ pt: 3, pb: 2, textAlign: 'center' }}>
        <Box sx={{ mb: 2 }}>
          <WarningAmberIcon sx={{ fontSize: 48, color: '#f59e0b' }} />
        </Box>
        <DialogTitle sx={{ p: 0, mb: 1, fontWeight: 700, fontSize: '1.25rem' }}>
          {title}
        </DialogTitle>
        <DialogContentText sx={{ color: '#64748b', fontSize: '0.95rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
