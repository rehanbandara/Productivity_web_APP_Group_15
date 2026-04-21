import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';

export function WorkspaceHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  accent = '#6366f1',
  action = null,
}) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: '#e2e8f0',
        boxShadow: '0 18px 42px rgba(15, 23, 42, 0.05)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {Icon && (
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: 3,
                  bgcolor: `${accent}16`,
                  color: accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 28 }} />
              </Box>
            )}
            <Box sx={{ maxWidth: 760 }}>
              {eyebrow && (
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    color: '#64748b',
                    fontWeight: 700,
                    letterSpacing: 1,
                    fontSize: '0.72rem',
                    mb: 0.75,
                  }}
                >
                  {eyebrow}
                </Typography>
              )}
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.8, mb: 1 }}>
                {title}
              </Typography>
              {description && (
                <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.7 }}>
                  {description}
                </Typography>
              )}
            </Box>
          </Stack>
          {action && (
            <Box sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' } }}>
              {action}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function WorkspaceMetricCard({
  label,
  value,
  description,
  icon: Icon,
  accent = '#6366f1',
  onClick,
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 4,
        border: '1px solid',
        borderColor: '#e2e8f0',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)',
        transition: onClick ? 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease' : 'none',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.08)',
          borderColor: `${accent}55`,
        } : undefined,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                color: '#64748b',
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: '0.68rem',
                mb: 0.75,
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.1,
                mb: 0.5,
                wordBreak: 'break-word',
              }}
            >
              {value}
            </Typography>
            {description && (
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {description}
              </Typography>
            )}
          </Box>
          {Icon && (
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: `${accent}16`,
                color: accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 22 }} />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function WorkspaceSection({
  title,
  description,
  action = null,
  children,
  sx = {},
  contentSx = {},
}) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: '#e2e8f0',
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.05)',
        ...sx,
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.75 }, ...contentSx }}>
        {(title || description || action) && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ mb: 2.25 }}
          >
            <Box>
              {title && (
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {title}
                </Typography>
              )}
              {description && (
                <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                  {description}
                </Typography>
              )}
            </Box>
            {action && <Box>{action}</Box>}
          </Stack>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export function WorkspaceEmptyState({
  icon: Icon,
  title,
  description,
  action = null,
  accent = '#6366f1',
}) {
  return (
    <Box sx={{ py: 7, textAlign: 'center' }}>
      {Icon && (
        <Box
          sx={{
            width: 68,
            height: 68,
            mx: 'auto',
            mb: 2,
            borderRadius: 3,
            bgcolor: `${accent}16`,
            color: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ fontSize: 34 }} />
        </Box>
      )}
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 420, mx: 'auto', mb: action ? 3 : 0 }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
}
