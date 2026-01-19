import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';

const selectQuestsState = (state: RootState) => state.quests;

export const selectUserQuests = createSelector(
  [selectQuestsState],
  (quests) => quests.userQuests
);

export const selectAllQuests = createSelector(
  [selectQuestsState],
  (quests) => quests.allQuests
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

export const selectCompletedQuests = createSelector(
  [selectUserQuests],
  (userQuests) => userQuests.filter((quest) => quest.isCompleted)
);

export const selectInProgressQuests = createSelector(
  [selectUserQuests],
  (userQuests) => userQuests.filter((quest) => !quest.isCompleted && quest.progress > 0)
);

export const selectNotStartedQuests = createSelector(
  [selectUserQuests],
  (userQuests) => userQuests.filter((quest) => !quest.isCompleted && quest.progress === 0)
);
