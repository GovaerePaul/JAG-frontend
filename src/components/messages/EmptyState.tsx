'use client';

import { Box, Typography, Paper } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  sx?: SxProps<Theme>;
}

export default function EmptyState({ icon, title, description, sx }: EmptyStateProps) {
  return (
    <Paper sx={{ p: 4, textAlign: 'center', ...sx }}>
      <Box
        sx={{
          fontSize: 64,
          color: 'text.secondary',
          mb: 2,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      )}
    </Paper>
  );
}
