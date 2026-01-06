'use client';

import { useCallback } from 'react';
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
import { getReceivedMessages, Message } from '@/lib/messages-api';
import { useMessages } from '@/hooks/useMessages';
import { formatDate } from '@/utils/date';
import { getStatusColor, getStatusLabel } from '@/utils/messages';

export default function ReceivedMessagesPage() {
  const router = useRouter();
  const t = useTranslations('messages');
  const tCommon = useTranslations('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchReceivedMessages = useCallback(async () => {
    const response = await getReceivedMessages();
    if (!response.success) {
      return { success: false, error: response.error || t('error.loading') };
    }
    return response;
  }, [t]);

  const getSenderIds = useCallback((msgs: Message[]) =>
    msgs
      .filter((msg) => msg.senderId && !msg.isAnonymous)
      .map((msg) => msg.senderId!),
  []);

  const { messages, loading, error, userNames } = useMessages({
    fetchMessages: fetchReceivedMessages,
    getUserIds: getSenderIds,
  });

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
                <Card key={message.id} elevation={2}>
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
                    <TableCell>{t('table.status')}</TableCell>
                    <TableCell>{t('table.date')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id} hover>
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

