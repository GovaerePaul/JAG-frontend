import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { messagesRepository } from './messagesRepository';
import type { Message, MessageSummary, SendMessageData } from '@/types/messages';
import type { ApiResponse } from '@/types/common';

interface MessagesState {
  receivedMessages: MessageSummary[];
  sentMessages: MessageSummary[];
  messagesById: Record<string, Message>;
  loading: {
    received: boolean;
    sent: boolean;
    message: boolean;
    action: boolean;
  };
  error: string | null;
  lastFetched: {
    received: number | null;
    sent: number | null;
  };
}

const initialState: MessagesState = {
  receivedMessages: [],
  sentMessages: [],
  messagesById: {},
  loading: {
    received: false,
    sent: false,
    message: false,
    action: false,
  },
  error: null,
  lastFetched: {
    received: null,
    sent: null,
  },
};

// Async thunks
export const fetchReceivedMessages = createAsyncThunk(
  'messages/fetchReceivedMessages',
  async (_, { rejectWithValue }) => {
    const response = await messagesRepository.getReceivedMessages();
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch received messages');
    }
    return response.data;
  }
);

export const fetchSentMessages = createAsyncThunk(
  'messages/fetchSentMessages',
  async (_, { rejectWithValue }) => {
    const response = await messagesRepository.getSentMessages();
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch sent messages');
    }
    return response.data;
  }
);

export const fetchMessage = createAsyncThunk(
  'messages/fetchMessage',
  async (messageId: string, { rejectWithValue }) => {
    const response = await messagesRepository.getMessage(messageId);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch message');
    }
    return response.data;
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (data: SendMessageData, { rejectWithValue, dispatch }) => {
    const response = await messagesRepository.sendMessage(data);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to send message');
    }
    // Refetch sent messages after sending
    await dispatch(fetchSentMessages());
    return response.data;
  }
);

export const markMessageAsRead = createAsyncThunk(
  'messages/markMessageAsRead',
  async (messageId: string, { rejectWithValue, dispatch }) => {
    const response = await messagesRepository.markMessageAsRead(messageId);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to mark message as read');
    }
    // Refetch received messages to update status
    await dispatch(fetchReceivedMessages());
    return { messageId, ...response.data };
  }
);

export const markMessageAsDelivered = createAsyncThunk(
  'messages/markMessageAsDelivered',
  async (messageId: string, { rejectWithValue }) => {
    const response = await messagesRepository.markMessageAsDelivered(messageId);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to mark message as delivered');
    }
    return { messageId, ...response.data };
  }
);

export const reportMessage = createAsyncThunk(
  'messages/reportMessage',
  async ({ messageId, reason }: { messageId: string; reason: string }, { rejectWithValue }) => {
    const response = await messagesRepository.reportMessage(messageId, reason);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to report message');
    }
    return { messageId, ...response.data };
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId: string, { rejectWithValue, dispatch }) => {
    const response = await messagesRepository.deleteMessage(messageId);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to delete message');
    }
    // Refetch sent messages after deletion
    await dispatch(fetchSentMessages());
    return { messageId, ...response.data };
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    updateMessageInStore: (state, action: PayloadAction<Message>) => {
      state.messagesById[action.payload.id] = action.payload;
      // Update in received messages if exists
      const receivedIndex = state.receivedMessages.findIndex((m) => m.id === action.payload.id);
      if (receivedIndex !== -1) {
        state.receivedMessages[receivedIndex] = {
          ...state.receivedMessages[receivedIndex],
          ...action.payload,
        };
      }
      // Update in sent messages if exists
      const sentIndex = state.sentMessages.findIndex((m) => m.id === action.payload.id);
      if (sentIndex !== -1) {
        state.sentMessages[sentIndex] = {
          ...state.sentMessages[sentIndex],
          ...action.payload,
        };
      }
    },
    clearMessages: (state) => {
      state.receivedMessages = [];
      state.sentMessages = [];
      state.messagesById = {};
      state.lastFetched = { received: null, sent: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchReceivedMessages
      .addCase(fetchReceivedMessages.pending, (state) => {
        state.loading.received = true;
        state.error = null;
      })
      .addCase(fetchReceivedMessages.fulfilled, (state, action) => {
        state.loading.received = false;
        state.receivedMessages = action.payload;
        state.error = null;
        state.lastFetched.received = Date.now();
      })
      .addCase(fetchReceivedMessages.rejected, (state, action) => {
        state.loading.received = false;
        state.error = action.payload as string;
      })
      // fetchSentMessages
      .addCase(fetchSentMessages.pending, (state) => {
        state.loading.sent = true;
        state.error = null;
      })
      .addCase(fetchSentMessages.fulfilled, (state, action) => {
        state.loading.sent = false;
        state.sentMessages = action.payload;
        state.error = null;
        state.lastFetched.sent = Date.now();
      })
      .addCase(fetchSentMessages.rejected, (state, action) => {
        state.loading.sent = false;
        state.error = action.payload as string;
      })
      // fetchMessage
      .addCase(fetchMessage.pending, (state) => {
        state.loading.message = true;
        state.error = null;
      })
      .addCase(fetchMessage.fulfilled, (state, action) => {
        state.loading.message = false;
        state.messagesById[action.payload.id] = action.payload;
        state.error = null;
      })
      .addCase(fetchMessage.rejected, (state, action) => {
        state.loading.message = false;
        state.error = action.payload as string;
      })
      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.loading.action = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.loading.action = false;
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.action = false;
        state.error = action.payload as string;
      })
      // markMessageAsRead
      .addCase(markMessageAsRead.pending, (state) => {
        state.loading.action = true;
        state.error = null;
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        state.loading.action = false;
        const messageId = action.payload.messageId;
        // Update message status in received messages
        const message = state.receivedMessages.find((m) => m.id === messageId);
        if (message) {
          message.status = 'read';
        }
        // Update in messagesById if exists
        if (state.messagesById[messageId]) {
          state.messagesById[messageId].status = 'read';
        }
        state.error = null;
      })
      .addCase(markMessageAsRead.rejected, (state, action) => {
        state.loading.action = false;
        state.error = action.payload as string;
      })
      // markMessageAsDelivered
      .addCase(markMessageAsDelivered.pending, (state) => {
        state.loading.action = true;
        state.error = null;
      })
      .addCase(markMessageAsDelivered.fulfilled, (state, action) => {
        state.loading.action = false;
        const messageId = action.payload.messageId;
        // Update message status
        const message = state.receivedMessages.find((m) => m.id === messageId);
        if (message && message.status === 'pending') {
          message.status = 'delivered';
        }
        if (state.messagesById[messageId]) {
          state.messagesById[messageId].status = 'delivered';
        }
        state.error = null;
      })
      .addCase(markMessageAsDelivered.rejected, (state, action) => {
        state.loading.action = false;
        state.error = action.payload as string;
      })
      // reportMessage
      .addCase(reportMessage.pending, (state) => {
        state.loading.action = true;
        state.error = null;
      })
      .addCase(reportMessage.fulfilled, (state, action) => {
        state.loading.action = false;
        const messageId = action.payload.messageId;
        // Mark message as reported
        const message = state.receivedMessages.find((m) => m.id === messageId);
        if (message) {
          message.isReported = true;
        }
        if (state.messagesById[messageId]) {
          state.messagesById[messageId].isReported = true;
        }
        state.error = null;
      })
      .addCase(reportMessage.rejected, (state, action) => {
        state.loading.action = false;
        state.error = action.payload as string;
      })
      // deleteMessage
      .addCase(deleteMessage.pending, (state) => {
        state.loading.action = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.loading.action = false;
        const messageId = action.payload.messageId;
        // Remove from sent messages
        state.sentMessages = state.sentMessages.filter((m) => m.id !== messageId);
        // Remove from messagesById
        delete state.messagesById[messageId];
        state.error = null;
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading.action = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateMessageInStore, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
