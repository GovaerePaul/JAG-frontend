'use client';

import { Typography, TypographyProps } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface GradientTypographyProps extends Omit<TypographyProps, 'sx'> {
  sx?: SxProps<Theme>;
}

export default function GradientTypography({
  children,
  sx,
  ...props
}: GradientTypographyProps) {
  return (
    <Typography
      {...props}
      sx={{
        fontWeight: 'bold',
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}
