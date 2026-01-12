'use client';

import { Box, Typography, LinearProgress, CircularProgress } from '@mui/material';
import { useTranslations } from 'next-intl';

interface LevelProgressProps {
  level: number;
  points: number;
  loading?: boolean;
}

export default function LevelProgress({ level, points, loading }: LevelProgressProps) {
  const tGamification = useTranslations('gamification');

  const currentLevelPoints = (level - 1) * 100;
  const nextLevelPoints = level * 100;
  const pointsInCurrentLevel = points - currentLevelPoints;
  const pointsNeededForNextLevel = nextLevelPoints - points;
  const progressPercentage = (pointsInCurrentLevel / 100) * 100;

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {tGamification('progress')}: {pointsInCurrentLevel}/100
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {tGamification('nextLevel')}: {pointsNeededForNextLevel} {tGamification('points')}
        </Typography>
      </Box>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(254, 107, 139, 0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              borderRadius: 5,
            },
          }}
        />
      )}
    </Box>
  );
}
