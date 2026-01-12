'use client';

import React, { createContext, useContext } from 'react';
import { useEventTypes } from '@/hooks/useEventTypes';
import { EventType } from '@/lib/events-api';

interface EventTypesContextValue {
  eventTypes: EventType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const EventTypesContext = createContext<EventTypesContextValue | undefined>(undefined);

export function EventTypesProvider({ children }: { children: React.ReactNode }) {
  const { eventTypes, loading, error, refetch } = useEventTypes();

  return (
    <EventTypesContext.Provider value={{ eventTypes, loading, error, refetch }}>
      {children}
    </EventTypesContext.Provider>
  );
}

export function useEventTypesContext() {
  const context = useContext(EventTypesContext);
  if (context === undefined) {
    throw new Error('useEventTypesContext must be used within an EventTypesProvider');
  }
  return context;
}
