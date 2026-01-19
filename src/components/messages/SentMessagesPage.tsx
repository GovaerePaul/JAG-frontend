'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { Outbox, ArrowBack } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageSummary } from '@/lib/messages-api';
import { useSentMessages } from '@/features/messages/useSentMessages';
import { useEventTypes } from '@/features/events/useEventTypes';
import { formatDate } from '@/utils/date';
import { getStatusColor, getStatusLabel } from '@/utils/messages';
import MessageCard from './MessageCard';
import EmptyState from './EmptyState';
import EventTypeDisplay from './EventTypeDisplay';

export default function SentMessagesPage() {
  const router = useRouter();
  const t = useTranslations('messages');
  const tCommon = useTranslations('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { messages: sentMessages, loading, error } = useSentMessages();

  const getReceiverIds = useCallback(
    (msgs: MessageSummary[]) => msgs.map((msg) => msg.receiverId).filter((id) => id),
    []
  );

  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUserNames = async () => {
      const uniqueUserIds = [...new Set(getReceiverIds(sentMessages))];
      const namesMap: Record<string, string> = {};

      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              namesMap[userId] = userData.displayName || userData.email || userId;
            } else {
              namesMap[userId] = userId;
            }
          } catch (err) {
            namesMap[userId] = userId;
          }
        })
      );

      setUserNames(namesMap);
    };

    if (sentMessages.length > 0) {
      loadUserNames();
    }
  }, [sentMessages, getReceiverIds]);

  const messages = sentMessages;
  const { eventTypes } = useEventTypes();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/')} sx={{ minWidth: 'auto' }}>
          {t('back')}
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          <Outbox sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('sent.title')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {messages.length === 0 && !loading && (
        <EmptyState icon={<Outbox />} title={t('sent.empty')} />
      )}

      {messages.length > 0 && (
        <>
          {isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  receiverName={message.receiverId ? userNames[message.receiverId] : undefined}
                  onClick={() => router.push(`/messages/sent?id=${message.id}`)}
                  eventTypes={eventTypes}
                  isSent={true}
                />
              ))}
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('table.to')}</TableCell>
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
                      onClick={() => router.push(`/messages/sent?id=${message.id}`)}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {message.receiverId
                              ? userNames[message.receiverId] || message.receiverId
                              : tCommon('unknown')}
                          </Typography>
                          {message.isAnonymous && (
                            <Chip label={t('anonymous')} size="small" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
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
          )}
        </>
      )}
    </Container>
  );
}
