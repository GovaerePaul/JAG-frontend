'use client';

import { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, EmojiEvents } from '@mui/icons-material';
import { useTranslations, useLocale } from 'next-intl';
import { useQuests, invalidateQuestsCache } from '@/hooks/useQuests';
import { UserQuestStatus } from '@/lib/quests-api';

interface QuestListProps {
  onQuestCompleted?: (questName: string, points: number) => void;
}

export default function QuestList({ onQuestCompleted }: QuestListProps = {}) {
  const { quests, loading, error } = useQuests();
  const locale = useLocale();
  const t = useTranslations('quests');
  const completedQuestIdsRef = useRef<Set<string>>(new Set());

  const getQuestName = (quest: UserQuestStatus['quest']) => {
    return quest.name[locale] || quest.name['en'] || quest.id;
  };

  const getQuestDescription = (quest: UserQuestStatus['quest']) => {
    return quest.description[locale] || quest.description['en'] || '';
  };

  const getCategoryLabel = (category: string) => {
    return t(`categories.${category}`) || category;
  };

  // Track newly completed quests for notifications
  useEffect(() => {
    const currentCompleted = new Set(
      quests.filter((q) => q.isCompleted).map((q) => q.quest.id)
    );
    const newlyCompleted = quests.filter(
      (q) => q.isCompleted && !completedQuestIdsRef.current.has(q.quest.id)
    );

    if (newlyCompleted.length > 0) {
      // Quest was just completed - trigger notification
      newlyCompleted.forEach((questStatus) => {
        const questName = getQuestName(questStatus.quest);
        if (onQuestCompleted) {
          onQuestCompleted(questName, questStatus.quest.pointsReward);
        }
      });
      
      completedQuestIdsRef.current = currentCompleted;
    } else {
      completedQuestIdsRef.current = currentCompleted;
    }
  }, [quests, onQuestCompleted, locale]);

  if (loading && quests.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (quests.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          {t('noQuests')}
        </Typography>
      </Paper>
    );
  }

  // Group quests by category
  const questsByCategory = quests.reduce((acc, questStatus) => {
    const category = questStatus.quest.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(questStatus);
    return acc;
  }, {} as Record<string, UserQuestStatus[]>);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <EmojiEvents sx={{ fontSize: 32, color: 'warning.main' }} />
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          {t('title')}
        </Typography>
      </Box>

      {Object.entries(questsByCategory).map(([category, categoryQuests]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
            {getCategoryLabel(category)}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {categoryQuests.map((questStatus) => {
              const { quest, isCompleted, progress, progressPercent } = questStatus;
              const questName = getQuestName(quest);
              const questDescription = getQuestDescription(quest);

              return (
                <Paper
                  key={quest.id}
                  sx={{
                    p: 2.5,
                    border: isCompleted ? '2px solid' : '1px solid',
                    borderColor: isCompleted ? 'success.main' : 'divider',
                    backgroundColor: isCompleted ? 'action.hover' : 'background.paper',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ mt: 0.5 }}>
                      {isCompleted ? (
                        <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
                      ) : (
                        <RadioButtonUnchecked sx={{ color: 'text.secondary', fontSize: 28 }} />
                      )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {questName}
                        </Typography>
                        <Chip
                          label={`+${quest.pointsReward} ${t('points')}`}
                          size="small"
                          color={isCompleted ? 'success' : 'primary'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {questDescription}
                      </Typography>

                      {!isCompleted && (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t('progress', { current: progress, target: quest.targetValue })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                              {progressPercent}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progressPercent}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'action.disabledBackground',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>
                      )}

                      {isCompleted && (
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                          {t('completed')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

