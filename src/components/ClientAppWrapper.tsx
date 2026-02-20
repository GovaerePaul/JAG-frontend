'use client';

import { useSyncExternalStore } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createEmotionCache from '@/lib/emotion-cache';
import ReduxProvider from './providers/ReduxProvider';
import CookieConsent from './CookieConsent';
import appTheme from '@/theme/appTheme';

// Temporairement désactivé pour isoler le crash - réactiver si l'app fonctionne sans
// const AndroidBackHandler = dynamic(() => import('./AndroidBackHandler'), { ssr: false, loading: () => null });

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
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          {children}
          <CookieConsent />
        </ThemeProvider>
      </CacheProvider>
    </ReduxProvider>
  );
}
