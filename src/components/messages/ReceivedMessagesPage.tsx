'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { Inbox, ArrowBack } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageSummary } from '@/lib/messages-api';
import { useAppData } from '@/contexts/AppDataContext';
import { useEventTypesContext } from '@/contexts/EventTypesContext';
import { formatDate } from '@/utils/date';
import { getStatusColor, getStatusLabel } from '@/utils/messages';

export default function ReceivedMessagesPage() {
  const router = useRouter();
  const t = useTranslations('messages');
  const tCommon = useTranslations('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Use shared data from Context to avoid duplicate API calls
  const { receivedMessages, refetchReceivedMessages } = useAppData();
  const refetch = refetchReceivedMessages;
  // Note: loading and error states are managed in AppLayout's hooks
  const loading = false;
  const error = null;

  const getSenderIds = useCallback((msgs: MessageSummary[]) =>
    msgs
      .filter((msg) => msg.senderId && !msg.isAnonymous)
      .map((msg) => msg.senderId!),
  []);

  // Load user names for messages
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const loadUserNames = async () => {
      const uniqueUserIds = [...new Set(getSenderIds(receivedMessages))];
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

    if (receivedMessages.length > 0) {
      loadUserNames();
    }
  }, [receivedMessages, getSenderIds]);

  const messages = receivedMessages;
  const { eventTypes } = useEventTypesContext();

  const getEventType = (eventTypeId: string) => {
    return eventTypes.find((et) => et.id === eventTypeId);
  };

  const getEventTypeName = (eventTypeId: string) => {
    const eventType = getEventType(eventTypeId);
    return eventType?.name || eventTypeId;
  };

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
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/')}
          sx={{ minWidth: 'auto' }}
        >
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
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Inbox sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {t('received.empty')}
          </Typography>
        </Paper>
      )}

      {messages.length > 0 && (
        <>
          {isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {messages.map((message) => (
                <Card 
                  key={message.id} 
                  elevation={2}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-2px)',
                    }
                  }}
                  onClick={() => router.push(`/messages/received?id=${message.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {message.isAnonymous ? t('anonymous') : t('from')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {message.isAnonymous 
                            ? t('anonymousSender') 
                            : (message.senderId ? (userNames[message.senderId] || message.senderId) : tCommon('unknown'))}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getEventType(message.eventTypeId)?.icon && (
                          <Typography variant="body2" component="span" sx={{ fontSize: '1.2rem' }}>
                            {getEventType(message.eventTypeId)?.icon}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {getEventTypeName(message.eventTypeId)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(message.createdAt) || tCommon('unknown')}
                      </Typography>
                      {message.isReported && (
                        <Chip label={t('reported')} color="error" size="small" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('table.from')}</TableCell>
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
                        }
                      }}
                      onClick={() => router.push(`/messages/received?id=${message.id}`)}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {message.isAnonymous 
                              ? t('anonymousSender') 
                              : (message.senderId ? (userNames[message.senderId] || message.senderId) : tCommon('unknown'))}
                          </Typography>
                          {message.isAnonymous && (
                            <Chip label={t('anonymous')} size="small" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getEventType(message.eventTypeId)?.icon && (
                            <Typography variant="body2" component="span" sx={{ fontSize: '1.2rem' }}>
                              {getEventType(message.eventTypeId)?.icon}
                            </Typography>
                          )}
                          <Typography variant="body2">
                            {getEventTypeName(message.eventTypeId)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                      <Chip
                        label={getStatusLabel(message.status, t)}
                        color={getStatusColor(message.status)}
                        size="small"
                      />
                      {message.isReported && (
                        <Chip
                          label={t('reported')}
                          color="error"
                          size="small"
                          sx={{ ml: 1 }}
                        />
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

