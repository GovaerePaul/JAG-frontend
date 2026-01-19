'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from '@/store';
import type { RootState } from '@/store/rootReducer';

interface ReduxProviderProps {
  children: React.ReactNode;
  preloadedState?: Partial<RootState>;
}

export default function ReduxProvider({ children, preloadedState }: ReduxProviderProps) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore(preloadedState);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
