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
import { Outbox, ArrowBack } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { getCachedUserDisplayNames } from '@/lib/user-cache';
import type { MessageSummary } from '@/types/messages';
import { useSentMessages } from '@/features/messages/useSentMessages';
import { useEventTypes } from '@/features/events/useEventTypes';
import MessageListView from './MessageListView';
import EmptyState from './EmptyState';

export default function SentMessagesPage() {
  const router = useRouter();
  const t = useTranslations('messages');

  const getReceiverIds = useCallback(
    (msgs: MessageSummary[]) => msgs.map((msg) => msg.receiverId).filter((id) => id),
    []
  );

  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const { messages: sentMessages, loading, error } = useSentMessages();

  useEffect(() => {
    const loadUserNames = async () => {
      const uniqueUserIds = [...new Set(getReceiverIds(sentMessages))];
      if (uniqueUserIds.length === 0) return;
      const namesMap = await getCachedUserDisplayNames(uniqueUserIds);
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
        <MessageListView
          variant="sent"
          messages={messages}
          userNames={userNames}
          eventTypes={eventTypes}
          onMessageClick={(message) => router.push(`/messages/sent?id=${message.id}`)}
        />
      )}
    </Container>
  );
}
