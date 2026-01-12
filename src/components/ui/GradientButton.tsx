'use client';

import { Button, ButtonProps } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface GradientButtonProps extends Omit<ButtonProps, 'sx'> {
  sx?: SxProps<Theme>;
}

export default function GradientButton({
  children,
  sx,
  disabled,
  ...props
}: GradientButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled}
      sx={{
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        boxShadow: '0 4px 15px rgba(254, 107, 139, 0.3)',
        textTransform: 'none',
        fontWeight: 600,
        transition: 'all 0.3s ease',
        '&:hover': {
          background: 'linear-gradient(45deg, #FE6B8B 40%, #FF8E53 100%)',
          boxShadow: '0 6px 20px rgba(254, 107, 139, 0.4)',
          transform: 'translateY(-2px)',
        },
        '&:disabled': {
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          opacity: 0.6,
        },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}
