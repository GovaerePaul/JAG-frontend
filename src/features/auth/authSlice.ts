import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authRepository } from './authRepository';
import type { UserProfile } from '@/types/auth';
import type { ApiResponse } from '@/types/common';

interface AuthState {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: AuthState = {
  userProfile: null,
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    const response = await authRepository.getUserProfile();
    if (!response.success || !response.data) {
      return rejectWithValue(response.error || 'Failed to fetch user profile');
    }
    return response.data;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: { displayName?: string; photoURL?: string }, { rejectWithValue, dispatch }) => {
    const response = await authRepository.updateUserProfile(data);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to update profile');
    }
    // Refetch profile after update
    await dispatch(fetchUserProfile());
    return response.data;
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { rejectWithValue }) => {
    const response = await authRepository.deleteUserAccount();
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to delete account');
    }
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.userProfile = null;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // deleteAccount
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.userProfile = null;
        state.error = null;
        state.lastFetched = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
