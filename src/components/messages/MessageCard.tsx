'use client';

import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import { useTranslations } from 'next-intl';
import { MessageSummary } from '@/lib/messages-api';
import { EventType } from '@/lib/events-api';
import { formatDate } from '@/utils/date';
import { getStatusColor, getStatusLabel } from '@/utils/messages';
import EventTypeDisplay from './EventTypeDisplay';

interface MessageCardProps {
  message: MessageSummary;
  senderName?: string;
  receiverName?: string;
  onClick: () => void;
  eventTypes: EventType[];
  isSent?: boolean;
}

export default function MessageCard({
  message,
  senderName,
  receiverName,
  onClick,
  eventTypes,
  isSent = false,
}: MessageCardProps) {
  const t = useTranslations('messages');
  const tCommon = useTranslations('common');

  return (
    <Card
      elevation={2}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {isSent ? t('to') : message.isAnonymous ? t('anonymous') : t('from')}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {isSent
                ? receiverName || message.receiverId || tCommon('unknown')
                : message.isAnonymous
                  ? t('anonymousSender')
                  : message.senderId
                    ? senderName || message.senderId
                    : tCommon('unknown')}
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(message.status, t)}
            color={getStatusColor(message.status)}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('table.eventType')}
          </Typography>
          <EventTypeDisplay
            eventTypeId={message.eventTypeId}
            eventTypes={eventTypes}
            variant="body2"
            iconSize="1.2rem"
          />
        </Box>

        {isSent && message.isAnonymous && (
          <Box sx={{ mb: 2 }}>
            <Chip label={t('anonymous')} size="small" />
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {formatDate(message.createdAt) || tCommon('unknown')}
          </Typography>
          {message.isReported && <Chip label={t('reported')} color="error" size="small" />}
        </Box>
      </CardContent>
    </Card>
  );
}
