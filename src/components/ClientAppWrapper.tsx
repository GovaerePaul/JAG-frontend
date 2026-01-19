'use client';

import { useSyncExternalStore } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createEmotionCache from '@/lib/emotion-cache';
import ReduxProvider from './providers/ReduxProvider';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const emotionCache = createEmotionCache();

// useSyncExternalStore pattern for hydration-safe client detection
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface ClientAppWrapperProps {
  children: React.ReactNode;
}

export default function ClientAppWrapper({ children }: ClientAppWrapperProps) {
  const isMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  if (!isMounted) {
    return (
      <div className="loading-container">
        <div>Loading application...</div>
      </div>
    );
  }

  return (
    <ReduxProvider>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </CacheProvider>
    </ReduxProvider>
  );
}
