import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userRepository } from './userRepository';
import type { ReceivableUser, DiscoverUsersParams, DiscoverUsersResponse } from '@/lib/users-api';
import type { UserStats } from './userRepository';

interface UserState {
  stats: UserStats | null;
  receivableUsers: ReceivableUser[];
  discoveredUsers: DiscoverUsersResponse | null;
  loading: {
    stats: boolean;
    receivableUsers: boolean;
    discoverUsers: boolean;
  };
  error: string | null;
  lastFetched: {
    stats: number | null;
    receivableUsers: number | null;
  };
}

const initialState: UserState = {
  stats: null,
  receivableUsers: [],
  discoveredUsers: null,
  loading: {
    stats: false,
    receivableUsers: false,
    discoverUsers: false,
  },
  error: null,
  lastFetched: {
    stats: null,
    receivableUsers: null,
  },
};

export const fetchUserStats = createAsyncThunk(
  'user/fetchUserStats',
  async (_, { rejectWithValue }) => {
    const response = await userRepository.getUserStats();
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch user stats');
    }
    return response.data;
  }
);

export const fetchReceivableUsers = createAsyncThunk(
  'user/fetchReceivableUsers',
  async (_, { rejectWithValue }) => {
    const response = await userRepository.getReceivableUsers();
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch receivable users');
    }
    return response.data;
  }
);

export const discoverUsers = createAsyncThunk(
  'user/discoverUsers',
  async (params: DiscoverUsersParams, { rejectWithValue }) => {
    const response = await userRepository.discoverUsers(params);
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to discover users');
    }
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.stats = null;
      state.receivableUsers = [];
      state.discoveredUsers = null;
      state.lastFetched = { stats: null, receivableUsers: null };
    },
    clearDiscoveredUsers: (state) => {
      state.discoveredUsers = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserStats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading.stats = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
        state.error = null;
        state.lastFetched.stats = Date.now();
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload as string;
      })
      // fetchReceivableUsers
      .addCase(fetchReceivableUsers.pending, (state) => {
        state.loading.receivableUsers = true;
        state.error = null;
      })
      .addCase(fetchReceivableUsers.fulfilled, (state, action) => {
        state.loading.receivableUsers = false;
        state.receivableUsers = action.payload;
        state.error = null;
        state.lastFetched.receivableUsers = Date.now();
      })
      .addCase(fetchReceivableUsers.rejected, (state, action) => {
        state.loading.receivableUsers = false;
        state.error = action.payload as string;
      })
      // discoverUsers
      .addCase(discoverUsers.pending, (state) => {
        state.loading.discoverUsers = true;
        state.error = null;
      })
      .addCase(discoverUsers.fulfilled, (state, action) => {
        state.loading.discoverUsers = false;
        state.discoveredUsers = action.payload;
        state.error = null;
      })
      .addCase(discoverUsers.rejected, (state, action) => {
        state.loading.discoverUsers = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUser, clearDiscoveredUsers } = userSlice.actions;
export default userSlice.reducer;
