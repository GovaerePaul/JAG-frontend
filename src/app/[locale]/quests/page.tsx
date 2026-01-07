'use client';

import { Container, Box, Paper } from '@mui/material';
import QuestList from '@/components/quests/QuestList';

export default function QuestsPage() {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4 }}>
          <QuestList />
        </Paper>
      </Container>
    </Box>
  );
}

