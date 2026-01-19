import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { questsRepository } from './questsRepository';
import type { UserQuestStatus } from '@/types/quests';

interface QuestsState {
  userQuests: UserQuestStatus[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: QuestsState = {
  userQuests: [],
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

const questsSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    clearQuests: (state) => {
      state.userQuests = [];
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { clearQuests } = questsSlice.actions;
export default questsSlice.reducer;
