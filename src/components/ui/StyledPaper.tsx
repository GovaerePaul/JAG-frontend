'use client';

import { Paper, PaperProps } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface StyledPaperProps extends Omit<PaperProps, 'sx'> {
  sx?: SxProps<Theme>;
}

export default function StyledPaper({
  children,
  elevation = 12,
  sx,
  ...props
}: StyledPaperProps) {
  return (
    <Paper
      {...props}
      elevation={elevation}
      sx={{
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 32px rgba(254, 107, 139, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.08) 0%, rgba(255, 142, 83, 0.08) 100%)',
          filter: 'blur(40px)',
        },
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}
