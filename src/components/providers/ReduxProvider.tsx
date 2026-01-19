'use client';

import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from '@/store';
import type { RootState } from '@/store/rootReducer';

interface ReduxProviderProps {
  children: React.ReactNode;
  preloadedState?: Partial<RootState>;
}

export default function ReduxProvider({ children, preloadedState }: ReduxProviderProps) {
  const store: AppStore = useMemo(() => makeStore(preloadedState), [preloadedState]);

  return <Provider store={store}>{children}</Provider>;
}
