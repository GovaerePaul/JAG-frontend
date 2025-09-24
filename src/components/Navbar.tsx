'use client';

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Container
} from '@mui/material';
import { useRouter } from 'next/navigation';
import UserDropdown from './UserDropdown';

export default function Navbar() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo / Titre */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            onClick={handleLogoClick}
            sx={{
              mr: 2,
              display: { xs: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            JustGift
          </Typography>

          {/* Espace flexible pour pousser le dropdown à droite */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Dropdown utilisateur */}
          <UserDropdown />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
