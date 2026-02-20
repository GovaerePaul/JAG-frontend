'use client';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import type { MessageSummary } from '@/types/messages';
import type { EventType } from '@/types/events';
import { formatDate } from '@/utils/date';
import { getStatusColor, getStatusLabel } from '@/utils/messages';
import MessageCard from './MessageCard';
import EventTypeDisplay from './EventTypeDisplay';
import { DISPLAY_MOBILE_ONLY, DISPLAY_DESKTOP_BLOCK } from '@/theme/layoutConstants';

interface MessageListViewProps {
  variant: 'sent' | 'received';
  messages: MessageSummary[];
  userNames: Record<string, string>;
  eventTypes: EventType[];
  onMessageClick: (message: MessageSummary) => void;
}

export default function MessageListView({
  variant,
  messages,
  userNames,
  eventTypes,
  onMessageClick,
}: MessageListViewProps) {
  const t = useTranslations('messages');
  const tCommon = useTranslations('common');
  const isSent = variant === 'sent';

  const renderNameCell = (message: MessageSummary) => {
    if (isSent) {
      return (
        <>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {message.receiverId
              ? userNames[message.receiverId] || message.receiverId
              : tCommon('unknown')}
          </Typography>
          {message.isAnonymous && <Chip label={t('anonymous')} size="small" sx={{ mt: 0.5 }} />}
        </>
      );
    }
    return (
      <>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {message.isAnonymous
            ? t('anonymousSender')
            : message.senderId
              ? userNames[message.senderId] || message.senderId
              : tCommon('unknown')}
        </Typography>
        {message.isAnonymous && <Chip label={t('anonymous')} size="small" sx={{ mt: 0.5 }} />}
      </>
    );
  };

  return (
    <>
      {/* Mobile: Cards */}
      <Box sx={{ display: DISPLAY_MOBILE_ONLY, flexDirection: 'column', gap: 2 }}>
        {messages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            receiverName={isSent ? (message.receiverId ? userNames[message.receiverId] : undefined) : undefined}
            senderName={!isSent && message.senderId ? userNames[message.senderId] : undefined}
            onClick={() => onMessageClick(message)}
            eventTypes={eventTypes}
            isSent={isSent}
          />
        ))}
      </Box>

      {/* Desktop: Table */}
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{ display: DISPLAY_DESKTOP_BLOCK }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{isSent ? t('table.to') : t('table.from')}</TableCell>
              <TableCell>{t('table.eventType')}</TableCell>
              <TableCell>{t('table.status')}</TableCell>
              <TableCell>{t('table.date')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message) => (
              <TableRow
                key={message.id}
                hover
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() => onMessageClick(message)}
              >
                <TableCell>
                  <Box>{renderNameCell(message)}</Box>
                </TableCell>
                <TableCell>
                  <EventTypeDisplay
                    eventTypeId={message.eventTypeId}
                    eventTypes={eventTypes}
                    variant="body2"
                    iconSize="1.2rem"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(message.status, t)}
                    color={getStatusColor(message.status)}
                    size="small"
                  />
                  {message.isReported && (
                    <Chip label={t('reported')} color="error" size="small" sx={{ ml: 1 }} />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(message.createdAt) || tCommon('unknown')}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
