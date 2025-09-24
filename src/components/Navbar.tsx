'use client';

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Container
} from '@mui/material';
import UserDropdown from './UserDropdown';

export default function Navbar() {
  return (
    <AppBar position="sticky" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo / Titre */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              mr: 2,
              display: { xs: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
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
