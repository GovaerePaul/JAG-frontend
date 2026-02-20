'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { initAnalytics } from '@/lib/firebase';

const STORAGE_KEY = 'cookie-consent';

const texts = {
  fr: {
    message: 'Ce site utilise des cookies pour analyser le trafic et améliorer votre expérience.',
    accept: 'Accepter',
    decline: 'Refuser',
  },
  en: {
    message: 'This site uses cookies to analyze traffic and improve your experience.',
    accept: 'Accept',
    decline: 'Decline',
  },
} as const;

function getLocale(): 'fr' | 'en' {
  if (typeof window === 'undefined') return 'fr';
  const segment = window.location.pathname.split('/')[1];
  return segment === 'en' ? 'en' : 'fr';
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (consent === 'accepted') {
      initAnalytics();
    } else if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    initAnalytics();
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, 'refused');
    setVisible(false);
  };

  if (!visible) return null;

  const t = texts[getLocale()];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(254, 107, 139, 0.2)',
        boxShadow: '0 -4px 24px rgba(254, 107, 139, 0.1)',
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', textAlign: { xs: 'center', sm: 'left' } }}
      >
        {t.message}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleDecline}
          sx={{
            textTransform: 'none',
            borderColor: 'rgba(254, 107, 139, 0.4)',
            color: 'text.secondary',
            '&:hover': {
              borderColor: '#FE6B8B',
              backgroundColor: 'rgba(254, 107, 139, 0.04)',
            },
          }}
        >
          {t.decline}
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleAccept}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            boxShadow: '0 2px 8px rgba(254, 107, 139, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FE6B8B 40%, #FF8E53 100%)',
              boxShadow: '0 4px 12px rgba(254, 107, 139, 0.4)',
            },
          }}
        >
          {t.accept}
        </Button>
      </Box>
    </Box>
  );
}
