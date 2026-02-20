'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

/**
 * Handles Android back button - navigates back in app history.
 * Only registers when running on native platform (Capacitor).
 * Uses dynamic imports to avoid crashing when Capacitor packages are unavailable.
 */
export default function AndroidBackHandler() {
  const router = useRouter();

  useEffect(() => {
    let listenerHandle: { remove: () => Promise<void> } | null = null;

    const setup = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const { App } = await import('@capacitor/app');
        const handler = await App.addListener('backButton', () => {
          router.back();
        });
        listenerHandle = handler;
      } catch {
        // Capacitor not available (web or packages not installed) - silent no-op
      }
    };

    setup();

    return () => {
      listenerHandle?.remove().catch(() => {});
    };
  }, [router]);

  return null;
}
