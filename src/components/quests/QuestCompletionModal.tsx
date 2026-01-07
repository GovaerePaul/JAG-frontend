'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { useTranslations, useLocale } from 'next-intl';
import { useQuestCompletionMonitor } from '@/hooks/useQuestCompletionMonitor';

interface QuestCompletion {
  questId: string;
  questName: string;
  points: number;
}

export default function QuestCompletionModal() {
  const [modalState, setModalState] = useState<{
    open: boolean;
    questName: string;
    points: number;
    questId: string | null;
  }>({
    open: false,
    questName: '',
    points: 0,
    questId: null,
  });

  const t = useTranslations('quests');
  const tCommon = useTranslations('common');
  const tGamification = useTranslations('gamification');

  const handleQuestCompleted = useCallback(
    (completion: QuestCompletion) => {
      setModalState({
        open: true,
        questName: completion.questName,
        points: completion.points,
        questId: completion.questId,
      });
    },
    []
  );

  const { markQuestAsShown } = useQuestCompletionMonitor(handleQuestCompleted);

  const handleClose = useCallback(() => {
    if (modalState.questId) {
      markQuestAsShown(modalState.questId);
    }
    setModalState({
      open: false,
      questName: '',
      points: 0,
      questId: null,
    });
  }, [modalState.questId, markQuestAsShown]);

  return (
    <Dialog
      open={modalState.open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <EmojiEvents sx={{ fontSize: 64, color: 'primary.main' }} />
          <Typography variant="h4" component="div">
            {t('congratulations')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {modalState.questName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('questCompletedMessage')} +{modalState.points}{' '}
          {tGamification('points')}!
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
  );
}

