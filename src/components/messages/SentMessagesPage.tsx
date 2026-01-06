'use client';

import { useState, useEffect } from 'react';
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
  Divider,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { Outbox, ArrowBack } from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { getSentMessages, Message } from '@/lib/messages-api';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SentMessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('messages');
  const tCommon = useTranslations('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getSentMessages();
        if (response.success && response.data) {
          setMessages(response.data);
          
          // Fetch displayNames for all unique receiver IDs
          const uniqueReceiverIds = [...new Set(
            response.data
              .map(msg => msg.receiverId)
              .filter(id => id)
          )];
          
          const namesMap: Record<string, string> = {};
          await Promise.all(
            uniqueReceiverIds.map(async (receiverId) => {
              try {
                const userDoc = await getDoc(doc(db, 'users', receiverId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  namesMap[receiverId] = userData.displayName || userData.email || receiverId;
                } else {
                  namesMap[receiverId] = receiverId;
                }
              } catch (err) {
                console.error(`Error fetching user ${receiverId}:`, err);
                namesMap[receiverId] = receiverId;
              }
            })
          );
          
          setUserNames(namesMap);
        } else {
          setError(response.error || t('error.loading'));
        }
      } catch (err) {
        setError(t('error.loading'));
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, t]);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      return tCommon('unknown');
    }
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return tCommon('unknown');
    }
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return 'success';
      case 'delivered':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'read':
        return t('status.read');
      case 'delivered':
        return t('status.delivered');
      case 'pending':
        return t('status.pending');
      default:
        return status;
    }
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
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Outbox sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {t('sent.empty')}
          </Typography>
        </Paper>
      )}

      {messages.length > 0 && (
        <>
          {isMobile ? (
            // Mobile view: Card list
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {messages.map((message) => (
                <Card key={message.id} elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('to')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {message.receiverId ? (userNames[message.receiverId] || message.receiverId) : tCommon('unknown')}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusLabel(message.status)}
                        color={getStatusColor(message.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    {message.isAnonymous && (
                      <Chip
                        label={t('anonymous')}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(message.createdAt)}
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
            // Desktop view: Table
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('table.to')}</TableCell>
                    <TableCell>{t('table.content')}</TableCell>
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
                            {message.receiverId ? (userNames[message.receiverId] || message.receiverId) : tCommon('unknown')}
                          </Typography>
                          {message.isAnonymous && (
                            <Chip label={t('anonymous')} size="small" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={message.content}
                        >
                          {message.content}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(message.status)}
                          color={getStatusColor(message.status) as any}
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
                          {formatDate(message.createdAt)}
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

