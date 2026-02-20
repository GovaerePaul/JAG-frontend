import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messagesRepository } from './messagesRepository';
import type { Message, MessageSummary, SendMessageData } from '@/types/messages';

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
  async (data: SendMessageData, { rejectWithValue }) => {
    const response = await messagesRepository.sendMessage(data);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to send message');
    }
    return response.data;
  }
);

export const markMessageAsRead = createAsyncThunk(
  'messages/markMessageAsRead',
  async (messageId: string, { rejectWithValue }) => {
    const response = await messagesRepository.markMessageAsRead(messageId);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to mark message as read');
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
  async (messageId: string, { rejectWithValue }) => {
    const response = await messagesRepository.deleteMessage(messageId);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to delete message');
    }
    return { messageId, ...response.data };
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.receivedMessages = [];
      state.sentMessages = [];
      state.messagesById = {};
      state.lastFetched = { received: null, sent: null };
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(markMessageAsRead.pending, (state) => {
        state.loading.action = true;
        state.error = null;
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        state.loading.action = false;
        const messageId = action.payload.messageId;
        const message = state.receivedMessages.find((m) => m.id === messageId);
        if (message) {
          message.status = 'read';
        }
        if (state.messagesById[messageId]) {
          state.messagesById[messageId].status = 'read';
        }
        state.error = null;
      })
      .addCase(markMessageAsRead.rejected, (state, action) => {
        state.loading.action = false;
        state.error = action.payload as string;
      })
      .addCase(reportMessage.pending, (state) => {
        state.loading.action = true;
        state.error = null;
      })
      .addCase(reportMessage.fulfilled, (state, action) => {
        state.loading.action = false;
        const messageId = action.payload.messageId;
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
      .addCase(deleteMessage.pending, (state) => {
        state.loading.action = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.loading.action = false;
        const messageId = action.payload.messageId;
        state.sentMessages = state.sentMessages.filter((m) => m.id !== messageId);
        delete state.messagesById[messageId];
        state.error = null;
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading.action = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
