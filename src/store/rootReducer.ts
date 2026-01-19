import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import messagesReducer from '@/features/messages/messagesSlice';
import questsReducer from '@/features/quests/questsSlice';
import eventsReducer from '@/features/events/eventsSlice';
import userReducer from '@/features/user/userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  messages: messagesReducer,
  quests: questsReducer,
  events: eventsReducer,
  user: userReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
