'use client';

import { Box, Typography } from '@mui/material';
import { Inbox, Outbox } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import StyledPaper from '@/components/ui/StyledPaper';
import GradientTypography from '@/components/ui/GradientTypography';
import MessageStatCard from './MessageStatCard';

interface MessageCounts {
  messagesSentCount: number;
  messagesReceivedCount: number;
}

interface UserDashboardCardProps {
  canReceive: boolean;
  canSend: boolean;
  unreadCount: number;
  messageCounts: MessageCounts;
  onNavigateReceived?: () => void;
  onNavigateSent?: () => void;
  showTitle?: boolean;
}

export default function UserDashboardCard({
  canReceive,
  canSend,
  unreadCount,
  messageCounts,
  onNavigateReceived,
  onNavigateSent,
  showTitle = true,
}: UserDashboardCardProps) {
  const router = useRouter();
  const tHome = useTranslations('home');

  const handleNavigateReceived = () => {
    if (onNavigateReceived) {
      onNavigateReceived();
    } else {
      router.push('/messages/received');
    }
  };

  const handleNavigateSent = () => {
    if (onNavigateSent) {
      onNavigateSent();
    } else {
      router.push('/messages/sent');
    }
  };

  return (
    <StyledPaper sx={{ p: 4, textAlign: 'center' }}>
      {showTitle && (
        <GradientTypography variant="h6" gutterBottom sx={{ mb: 3 }}>
          {tHome('userDashboard.title')}
        </GradientTypography>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 4,
          mt: showTitle ? 3 : 0,
          justifyContent: 'center',
        }}
      >
        {(canReceive || messageCounts.messagesReceivedCount > 0) && (
          <MessageStatCard
            icon={<Inbox />}
            count={messageCounts.messagesReceivedCount}
            label={tHome('userDashboard.messagesReceived')}
            unreadCount={unreadCount}
            onClick={canReceive ? handleNavigateReceived : undefined}
            color="primary"
          />
        )}
        {(canSend || messageCounts.messagesSentCount > 0) && (
          <MessageStatCard
            icon={<Outbox />}
            count={messageCounts.messagesSentCount}
            label={tHome('userDashboard.messagesSent')}
            onClick={canSend ? handleNavigateSent : undefined}
            color="secondary"
          />
        )}
      </Box>
    </StyledPaper>
  );
}
