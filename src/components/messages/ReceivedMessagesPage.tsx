'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { Inbox, ArrowBack } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { getCachedUserDisplayNames } from '@/lib/user-cache';
import type { MessageSummary } from '@/types/messages';
import { useReceivedMessages } from '@/features/messages/useReceivedMessages';
import { useEventTypes } from '@/features/events/useEventTypes';
import MessageListView from './MessageListView';
import EmptyState from './EmptyState';

export default function ReceivedMessagesPage() {
  const router = useRouter();
  const t = useTranslations('messages');

  const getSenderIds = useCallback(
    (msgs: MessageSummary[]) =>
      msgs.filter((msg) => msg.senderId && !msg.isAnonymous).map((msg) => msg.senderId!),
    []
  );

  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const { messages: receivedMessages, loading, error } = useReceivedMessages();

  useEffect(() => {
    const loadUserNames = async () => {
      const uniqueUserIds = [...new Set(getSenderIds(receivedMessages))];
      if (uniqueUserIds.length === 0) return;
      const namesMap = await getCachedUserDisplayNames(uniqueUserIds);
      setUserNames(namesMap);
    };

    if (receivedMessages.length > 0) {
      loadUserNames();
    }
  }, [receivedMessages, getSenderIds]);

  const messages = receivedMessages;
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
          <Inbox sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('received.title')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {messages.length === 0 && !loading && (
        <EmptyState icon={<Inbox />} title={t('received.empty')} />
      )}

      {messages.length > 0 && (
        <MessageListView
          variant="received"
          messages={messages}
          userNames={userNames}
          eventTypes={eventTypes}
          onMessageClick={(message) => router.push(`/messages/received?id=${message.id}`)}
        />
      )}
    </Container>
  );
}
