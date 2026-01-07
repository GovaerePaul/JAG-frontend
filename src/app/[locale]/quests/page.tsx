'use client';

import { Container, Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import QuestList from '@/components/quests/QuestList';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { EmojiEvents } from '@mui/icons-material';

export default function QuestsPage() {
  const t = useTranslations('quests');
  const tCommon = useTranslations('common');
  const tGamification = useTranslations('gamification');
  const [questCompletedModal, setQuestCompletedModal] = useState<{
    open: boolean;
    questName: string;
    points: number;
  }>({ open: false, questName: '', points: 0 });

  const handleClose = () => {
    setQuestCompletedModal({ ...questCompletedModal, open: false });
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4 }}>
          <QuestList
            onQuestCompleted={(questName, points) => {
              setQuestCompletedModal({
                open: true,
                questName,
                points,
              });
            }}
          />
        </Paper>

        {/* Quest Completion Modal */}
        <Dialog
          open={questCompletedModal.open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <EmojiEvents sx={{ fontSize: 64, color: 'primary.main' }} />
              <Typography variant="h4" component="div">
                {t('congratulations')}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {questCompletedModal.questName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('questCompletedMessage')} +{questCompletedModal.points} {tGamification('points')}!
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
            <Button
              onClick={handleClose}
              variant="contained"
              color="primary"
              size="large"
              sx={{ minWidth: 120 }}
            >
              {tCommon('ok')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

