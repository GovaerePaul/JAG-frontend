import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventsRepository } from './eventsRepository';
import type { EventType } from '@/lib/events-api';

interface EventsState {
  eventTypes: EventType[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  locale: string;
}

const initialState: EventsState = {
  eventTypes: [],
  loading: false,
  error: null,
  lastFetched: null,
  locale: 'en',
};

export const fetchEventTypes = createAsyncThunk(
  'events/fetchEventTypes',
  async (locale: string = 'en', { rejectWithValue }) => {
    const response = await eventsRepository.getEventTypes(locale);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch event types');
    }
    return { eventTypes: response.data, locale };
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearEvents: (state) => {
      state.eventTypes = [];
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.eventTypes = action.payload.eventTypes;
        state.locale = action.payload.locale;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchEventTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
