'use client';

import { Box, Typography, Button } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import StyledPaper from '@/components/ui/StyledPaper';
import LevelIcon from '@/components/LevelIcon';
import LevelProgress from './LevelProgress';

interface GamificationCardProps {
  level: number;
  points: number;
  totalPointsEarned: number;
  showViewQuestsButton?: boolean;
  onViewQuests?: () => void;
  loading?: boolean;
}

export default function GamificationCard({
  level,
  points,
  totalPointsEarned,
  showViewQuestsButton = false,
  onViewQuests,
  loading = false,
}: GamificationCardProps) {
  const router = useRouter();
  const tGamification = useTranslations('gamification');
  const tHome = useTranslations('home');

  const handleViewQuests = () => {
    if (onViewQuests) {
      onViewQuests();
    } else {
      router.push('/quests');
    }
  };

  return (
    <StyledPaper sx={{ p: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(254, 107, 139, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)',
          }}
        >
          <LevelIcon level={level} size={56} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {tGamification('level')} {level}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {points} {tGamification('points')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {tGamification('totalEarned')}: {totalPointsEarned} {tGamification('points')}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <LevelProgress level={level} points={points} loading={loading} />
      </Box>
      {showViewQuestsButton && (
        <Box sx={{ mt: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<EmojiEvents />}
            onClick={handleViewQuests}
            sx={{
              borderRadius: 2,
              borderColor: '#FE6B8B',
              color: '#FE6B8B',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                borderColor: '#FE6B8B',
                background: 'rgba(254, 107, 139, 0.08)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(254, 107, 139, 0.2)',
              },
            }}
          >
            {tHome('viewQuests')}
          </Button>
        </Box>
      )}
    </StyledPaper>
  );
}
