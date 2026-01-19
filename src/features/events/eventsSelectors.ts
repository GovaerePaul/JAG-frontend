import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';
import type { EventCategory } from '@/lib/events-api';

const selectEventsState = (state: RootState) => state.events;

export const selectEventTypes = createSelector(
  [selectEventsState],
  (events) => events.eventTypes
);

export const selectEventsLoading = createSelector(
  [selectEventsState],
  (events) => events.loading
);

export const selectEventsError = createSelector(
  [selectEventsState],
  (events) => events.error
);

export const selectEventsLastFetched = createSelector(
  [selectEventsState],
  (events) => events.lastFetched
);

export const selectEventsLocale = createSelector(
  [selectEventsState],
  (events) => events.locale
);

export const selectEventTypesByCategory = (category: EventCategory) =>
  createSelector(
    [selectEventTypes],
    (eventTypes) => eventTypes.filter((event) => event.category === category)
  );

export const selectJoyfulEvents = createSelector(
  [selectEventTypes],
  (eventTypes) => eventTypes.filter((event) => event.category === 'joyful')
);

export const selectSadEvents = createSelector(
  [selectEventTypes],
  (eventTypes) => eventTypes.filter((event) => event.category === 'sad')
);

export const selectNeutralEvents = createSelector(
  [selectEventTypes],
  (eventTypes) => eventTypes.filter((event) => event.category === 'neutral')
);
