import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';

const selectAuthState = (state: RootState) => state.auth;

export const selectUserProfile = createSelector(
  [selectAuthState],
  (auth) => auth.userProfile
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

export const selectIsAuthenticated = createSelector(
  [selectUserProfile],
  (userProfile) => userProfile !== null
);
