import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { questsRepository } from './questsRepository';
import type { Quest, UserQuestStatus } from '@/types/quests';

interface QuestsState {
  userQuests: UserQuestStatus[];
  allQuests: Quest[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: QuestsState = {
  userQuests: [],
  allQuests: [],
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchUserQuests = createAsyncThunk(
  'quests/fetchUserQuests',
  async (_, { rejectWithValue }) => {
    const response = await questsRepository.getUserQuests();
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch user quests');
    }
    return response.data;
  }
);

export const fetchAllQuests = createAsyncThunk(
  'quests/fetchAllQuests',
  async (_, { rejectWithValue }) => {
    const response = await questsRepository.getAllQuests();
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch all quests');
    }
    return response.data;
  }
);

const questsSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    clearQuests: (state) => {
      state.userQuests = [];
      state.allQuests = [];
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserQuests
      .addCase(fetchUserQuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserQuests.fulfilled, (state, action) => {
        state.loading = false;
        state.userQuests = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchUserQuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchAllQuests
      .addCase(fetchAllQuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllQuests.fulfilled, (state, action) => {
        state.loading = false;
        state.allQuests = action.payload;
        state.error = null;
      })
      .addCase(fetchAllQuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearQuests } = questsSlice.actions;
export default questsSlice.reducer;
