'use client';

import { Container, Box, Paper } from '@mui/material';
import QuestList from '@/components/quests/QuestList';

export default function QuestsPage() {
  return (
    <Box
      sx={{
        py: 4,
        position: 'relative',
        minHeight: '100vh',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #fef5f8 0%, #fff5f0 50%, #f0f8ff 100%)',
          zIndex: -1,
        },
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={12}
          sx={{
            p: 4,
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
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.08) 0%, rgba(255, 142, 83, 0.08) 100%)',
              filter: 'blur(50px)',
            },
          }}
        >
          <QuestList />
        </Paper>
      </Container>
    </Box>
  );
}

