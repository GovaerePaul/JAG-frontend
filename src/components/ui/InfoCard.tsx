'use client';

import { Card, CardContent, Box, Button } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import GradientTypography from './GradientTypography';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  sx?: SxProps<Theme>;
}

export default function InfoCard({
  title,
  children,
  actionButton,
  sx,
}: InfoCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(254, 107, 139, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(254, 107, 139, 0.15)',
          transform: 'translateY(-2px)',
        },
        ...sx,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: actionButton ? 2 : 0 }}>
          <GradientTypography variant="h6" gutterBottom={!actionButton}>
            {title}
          </GradientTypography>
          {actionButton && (
            <Button
              variant="outlined"
              size="small"
              startIcon={actionButton.icon}
              onClick={actionButton.onClick}
              sx={{
                borderColor: '#FE6B8B',
                color: '#FE6B8B',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#FE6B8B',
                  background: 'rgba(254, 107, 139, 0.08)',
                },
              }}
            >
              {actionButton.label}
            </Button>
          )}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}
