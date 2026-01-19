import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';

const selectQuestsState = (state: RootState) => state.quests;

export const selectUserQuests = createSelector(
  [selectQuestsState],
  (quests) => quests.userQuests
);

export const selectQuestsLoading = createSelector(
  [selectQuestsState],
  (quests) => quests.loading
);

export const selectQuestsError = createSelector(
  [selectQuestsState],
  (quests) => quests.error
);

export const selectQuestsLastFetched = createSelector(
  [selectQuestsState],
  (quests) => quests.lastFetched
);
