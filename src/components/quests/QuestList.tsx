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
import { useQuests } from '@/features/quests/useQuests';
import type { UserQuestStatus } from '@/types/quests';

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

  useEffect(() => {
    const currentCompleted = new Set(
      quests.filter((q) => q.isCompleted).map((q) => q.quest.id)
    );
    const newlyCompleted = quests.filter(
      (q) => q.isCompleted && !completedQuestIdsRef.current.has(q.quest.id)
    );

    if (newlyCompleted.length > 0) {
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

  const questsByCategory = quests.reduce((acc, questStatus) => {
    const category = questStatus.quest.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(questStatus);
    return acc;
  }, {} as Record<string, UserQuestStatus[]>);

  return (
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)',
          }}
        >
          <EmojiEvents
            sx={{
              fontSize: 32,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          />
        </Box>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t('title')}
        </Typography>
      </Box>

      {Object.entries(questsByCategory).map(([category, categoryQuests]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
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
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: isCompleted ? '2px solid' : '1px solid',
                    borderColor: isCompleted ? '#4caf50' : 'rgba(254, 107, 139, 0.2)',
                    backgroundColor: isCompleted
                      ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)'
                      : 'rgba(255, 255, 255, 0.7)',
                    background: isCompleted
                      ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)'
                      : 'rgba(255, 255, 255, 0.7)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(254, 107, 139, 0.15)',
                      borderColor: isCompleted ? '#4caf50' : '#FE6B8B',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ mt: 0.5 }}>
                      {isCompleted ? (
                        <CheckCircle sx={{ color: '#4caf50', fontSize: 32 }} />
                      ) : (
                        <RadioButtonUnchecked
                          sx={{
                            color: '#FE6B8B',
                            fontSize: 32,
                            '&:hover': {
                              color: '#FF8E53',
                            },
                          }}
                        />
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
                          sx={{
                            fontWeight: 'bold',
                            background: isCompleted
                              ? 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)'
                              : 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(254, 107, 139, 0.3)',
                          }}
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
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: 'rgba(254, 107, 139, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 5,
                                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                              },
                            }}
                          />
                        </Box>
                      )}

                      {isCompleted && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            color: '#4caf50',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          ✓ {t('completed')}
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

