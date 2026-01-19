import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/rootReducer';

const selectMessagesState = (state: RootState) => state.messages;

export const selectReceivedMessages = createSelector(
  [selectMessagesState],
  (messages) => messages.receivedMessages
);

export const selectSentMessages = createSelector(
  [selectMessagesState],
  (messages) => messages.sentMessages
);

export const selectMessageById = (messageId: string) =>
  createSelector(
    [selectMessagesState],
    (messages) => messages.messagesById[messageId]
  );

export const selectMessagesLoading = createSelector(
  [selectMessagesState],
  (messages) => messages.loading
);

export const selectReceivedMessagesLoading = createSelector(
  [selectMessagesState],
  (messages) => messages.loading.received
);

export const selectSentMessagesLoading = createSelector(
  [selectMessagesState],
  (messages) => messages.loading.sent
);

export const selectMessagesError = createSelector(
  [selectMessagesState],
  (messages) => messages.error
);

export const selectUnreadMessages = createSelector(
  [selectReceivedMessages],
  (messages) => messages.filter((msg) => msg.status !== 'read')
);

export const selectUnreadCount = createSelector(
  [selectUnreadMessages],
  (unreadMessages) => unreadMessages.length
);

export const selectReceivedMessagesLastFetched = createSelector(
  [selectMessagesState],
  (messages) => messages.lastFetched.received
);

export const selectSentMessagesLastFetched = createSelector(
  [selectMessagesState],
  (messages) => messages.lastFetched.sent
);
