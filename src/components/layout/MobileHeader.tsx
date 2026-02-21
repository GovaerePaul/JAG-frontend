'use client';

import { AppBar, Toolbar, Box, Container } from '@mui/material';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { getLogoPath } from '@/utils/level-icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { DISPLAY_MOBILE_ONLY } from '@/theme/layoutConstants';

export default function MobileHeader() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        display: DISPLAY_MOBILE_ONLY,
        top: { xs: 'max(env(safe-area-inset-top, 0px), 28px)', md: 0 },
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(254, 107, 139, 0.1)',
        boxShadow: '0 2px 20px rgba(254, 107, 139, 0.08)',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
        <Toolbar disableGutters sx={{ py: { xs: 0.5, sm: 1 }, minHeight: { xs: 56, sm: 64 } }}>
          <Box
            onClick={handleLogoClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              height: { xs: 54, sm: 62 },
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Image
              src={getLogoPath()}
              alt="JustGift Logo"
              width={0}
              height={0}
              style={{
                width: 'auto',
                height: '100%',
                objectFit: 'contain',
              }}
              priority
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LanguageSwitcher />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
