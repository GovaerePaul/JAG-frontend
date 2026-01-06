'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Send, Close } from '@mui/icons-material';
import { useEventTypes } from '@/hooks/useEventTypes';
import { sendMessage, SendMessageData } from '@/lib/messages-api';

interface SendMessageFormProps {
  open: boolean;
  onClose: () => void;
  receiverId?: string;
  receiverName?: string;
  onSuccess?: () => void;
}

export default function SendMessageForm({
  open,
  onClose,
  receiverId = '',
  receiverName = '',
  onSuccess,
}: SendMessageFormProps) {
  const { eventTypes, loading: eventsLoading } = useEventTypes();
  const [formData, setFormData] = useState<SendMessageData>({
    receiverId: receiverId,
    eventTypeId: '',
    content: '',
    isAnonymous: false,
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedEvent = eventTypes.find((e) => e.id === formData.eventTypeId);

  const handleSubmit = async () => {
    setError(null);

    if (!formData.receiverId) {
      setError('Please enter a receiver ID');
      return;
    }
    if (!formData.eventTypeId) {
      setError('Please select an event type');
      return;
    }
    if (!formData.content.trim()) {
      setError('Please write a message');
      return;
    }

    setSending(true);

    const response = await sendMessage(formData);

    if (response.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          receiverId: '',
          eventTypeId: '',
          content: '',
          isAnonymous: false,
        });
        onSuccess?.();
        onClose();
      }, 1500);
    } else {
      setError(response.error || 'Failed to send message');
    }

    setSending(false);
  };

  const handleClose = () => {
    if (!sending) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  // Group events by category
  const joyfulEvents = eventTypes.filter((e) => e.category === 'joyful');
  const sadEvents = eventTypes.filter((e) => e.category === 'sad');
  const neutralEvents = eventTypes.filter((e) => e.category === 'neutral');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send color="primary" />
          <Typography variant="h6">Send a Message</Typography>
        </Box>
        <Button onClick={handleClose} disabled={sending} sx={{ minWidth: 'auto' }}>
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ my: 2 }}>
            Message sent successfully! 🎉
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Receiver */}
            <TextField
              label="Receiver ID"
              value={formData.receiverId}
              onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
              placeholder="Enter the receiver's user ID"
              disabled={!!receiverId || sending}
              helperText={receiverName ? `Sending to: ${receiverName}` : 'Enter the ID of the person you want to send a message to'}
              fullWidth
            />

            {/* Event Type */}
            <FormControl fullWidth disabled={eventsLoading || sending}>
              <InputLabel>Occasion</InputLabel>
              <Select
                value={formData.eventTypeId}
                onChange={(e) => setFormData({ ...formData, eventTypeId: e.target.value })}
                label="Occasion"
              >
                {joyfulEvents.length > 0 && (
                  <MenuItem disabled>
                    <Typography variant="caption" color="text.secondary">
                      — Joyful Events —
                    </Typography>
                  </MenuItem>
                )}
                {joyfulEvents.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.icon} {event.name}
                  </MenuItem>
                ))}

                {sadEvents.length > 0 && (
                  <MenuItem disabled>
                    <Typography variant="caption" color="text.secondary">
                      — Support & Comfort —
                    </Typography>
                  </MenuItem>
                )}
                {sadEvents.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.icon} {event.name}
                  </MenuItem>
                ))}

                {neutralEvents.length > 0 && (
                  <MenuItem disabled>
                    <Typography variant="caption" color="text.secondary">
                      — Encouragement —
                    </Typography>
                  </MenuItem>
                )}
                {neutralEvents.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.icon} {event.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedEvent && (
              <Chip
                icon={<span>{selectedEvent.icon}</span>}
                label={selectedEvent.description}
                variant="outlined"
                color="primary"
              />
            )}

            {/* Message Content */}
            <TextField
              label="Your Message"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your heartfelt message here..."
              multiline
              rows={4}
              disabled={sending}
              inputProps={{ maxLength: 2000 }}
              helperText={`${formData.content.length}/2000 characters`}
              fullWidth
            />

            {/* Anonymous */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  disabled={sending}
                />
              }
              label="Send anonymously (the receiver won't see your identity)"
            />
          </Box>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={sending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={sending || !formData.receiverId || !formData.eventTypeId || !formData.content.trim()}
            startIcon={sending ? <CircularProgress size={20} /> : <Send />}
          >
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

