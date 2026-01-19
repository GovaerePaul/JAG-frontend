import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';

const selectUserState = (state: RootState) => state.user;

export const selectUserStats = createSelector(
  [selectUserState],
  (user) => user.stats
);

export const selectReceivableUsers = createSelector(
  [selectUserState],
  (user) => user.receivableUsers
);

export const selectDiscoveredUsers = createSelector(
  [selectUserState],
  (user) => user.discoveredUsers
);

export const selectUserLoading = createSelector(
  [selectUserState],
  (user) => user.loading
);

export const selectUserStatsLoading = createSelector(
  [selectUserState],
  (user) => user.loading.stats
);

export const selectReceivableUsersLoading = createSelector(
  [selectUserState],
  (user) => user.loading.receivableUsers
);

export const selectDiscoverUsersLoading = createSelector(
  [selectUserState],
  (user) => user.loading.discoverUsers
);

export const selectUserError = createSelector(
  [selectUserState],
  (user) => user.error
);

export const selectUserStatsLastFetched = createSelector(
  [selectUserState],
  (user) => user.lastFetched.stats
);

export const selectReceivableUsersLastFetched = createSelector(
  [selectUserState],
  (user) => user.lastFetched.receivableUsers
);

export const selectDiscoveredUsersList = createSelector(
  [selectDiscoveredUsers],
  (discoveredUsers) => discoveredUsers?.users || []
);

export const selectDiscoveredUsersHasMore = createSelector(
  [selectDiscoveredUsers],
  (discoveredUsers) => discoveredUsers?.hasMore || false
);

export const selectDiscoveredUsersTotal = createSelector(
  [selectDiscoveredUsers],
  (discoveredUsers) => discoveredUsers?.total || 0
);
