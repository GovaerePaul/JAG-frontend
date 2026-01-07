'use client';

import { Container, Box, Paper } from '@mui/material';
import QuestList from '@/components/quests/QuestList';
import { Snackbar, Alert } from '@mui/material';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function QuestsPage() {
  const t = useTranslations('quests');
  const tCommon = useTranslations('common');
  const tGamification = useTranslations('gamification');
  const [questCompletedNotification, setQuestCompletedNotification] = useState<{
    open: boolean;
    questName: string;
    points: number;
  }>({ open: false, questName: '', points: 0 });

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4 }}>
          <QuestList
            onQuestCompleted={(questName, points) => {
              setQuestCompletedNotification({
                open: true,
                questName,
                points,
              });
            }}
          />
        </Paper>

        {/* Quest Completion Notification */}
        <Snackbar
          open={questCompletedNotification.open}
          autoHideDuration={6000}
          onClose={() => setQuestCompletedNotification({ ...questCompletedNotification, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setQuestCompletedNotification({ ...questCompletedNotification, open: false })}
            severity="success"
            sx={{ width: '100%' }}
          >
            {tCommon('success')}: {questCompletedNotification.questName} - +{questCompletedNotification.points} {tGamification('points')}!
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

