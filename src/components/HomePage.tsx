'use client';

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Paper
} from '@mui/material';
import { Redeem, Favorite, Groups } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="lg">
        {/* Section Hero */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Bienvenue sur JustGift
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, fontSize: { xs: '1.2rem', md: '1.5rem' } }}
          >
            {user 
              ? `Salut ${user.displayName || user.email} ! 👋`
              : 'La plateforme pour organiser vos cadeaux'
            }
          </Typography>
          {!user && (
            <Button
              variant="contained"
              size="large"
              sx={{ borderRadius: 3, px: 4, py: 1.5 }}
              onClick={() => router.push('/auth')}
            >
              Commencer maintenant
            </Button>
          )}
        </Box>

        {/* Section Fonctionnalités */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 4, 
          mb: 6 
        }}>
          <Box sx={{ flex: 1 }}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Redeem sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Gérer vos cadeaux
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Organisez et planifiez tous vos cadeaux en un seul endroit
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Favorite sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Listes de souhaits
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Créez et partagez vos listes de souhaits avec vos proches
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Groups sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Partage familial
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Partagez avec votre famille et évitez les doublons
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Section Statistiques */}
        {user && (
          <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Votre tableau de bord
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 3, 
              mt: 2,
              justifyContent: 'space-around' 
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cadeaux planifiés
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Listes créées
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amis connectés
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
