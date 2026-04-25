"use client";

/**
 * Esempi di utilizzo del componente Button
 * Questa pagina mostra tutte le varianti, size e stati disponibili
 *
 * Per usare questi esempi:
 * 1. Vai su http://localhost:3000/button-stories
 * 2. Scrivi una route dinamica in app/button-stories/page.tsx che importa questo componente
 */

import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Grid } from '@mui/material';
import { Heart, Download, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import Button from './Button';

export default function ButtonStories() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h1" sx={{ color: 'text.primary', mb: 0.5, fontWeight: 700, fontSize: '2.5rem' }}>
          Button Component Stories
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 6 }}>Tutti gli stati e varianti del componente Button</Typography>

        {/* VARIANTI */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ color: 'text.primary', mb: 2, fontWeight: 700, fontSize: '1.5rem' }}>Varianti</Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
            gap: 3, 
            bgcolor: 'background.paper', 
            p: 3, 
            borderRadius: '30px', 
            border: `1px solid ${theme.palette.divider}` 
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Primary (Default)</Typography>
              <Button variant="primary">Accedi</Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Secondary</Typography>
              <Button variant="secondary">Annulla</Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Glass</Typography>
              <Button variant="glass">Esplora</Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Danger</Typography>
              <Button variant="danger">Elimina</Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Success</Typography>
              <Button variant="success">Salva</Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Ghost</Typography>
              <Button variant="ghost">Link</Button>
            </Box>
          </Box>
        </Box>

        {/* SIZE */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ color: 'text.primary', mb: 2, fontWeight: 700, fontSize: '1.5rem' }}>Dimensioni</Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            bgcolor: 'background.paper', 
            p: 3, 
            borderRadius: '30px', 
            border: `1px solid ${theme.palette.divider}` 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', width: 80 }}>Small</Typography>
              <Button size="sm">Click me</Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', width: 80 }}>Medium</Typography>
              <Button size="md">Click me</Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', width: 80 }}>Large</Typography>
              <Button size="lg">Click me</Button>
            </Box>
          </Box>
        </Box>

        {/* CON ICON */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ color: 'text.primary', mb: 2, fontWeight: 700, fontSize: '1.5rem' }}>Con Icon</Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
            gap: 3, 
            bgcolor: 'background.paper', 
            p: 3, 
            borderRadius: '30px', 
            border: `1px solid ${theme.palette.divider}` 
          }}>
            <Button variant="primary" icon={<Heart size={20} />}>
              Like
            </Button>
            <Button variant="secondary" icon={<Download size={20} />}>
              Scarica
            </Button>
            <Button variant="danger" icon={<AlertCircle size={20} />}>
              Attenzione
            </Button>
            <Button variant="success" icon={<CheckCircle2 size={20} />}>
              Confermo
            </Button>
            <Button variant="glass" icon={<Settings size={20} />}>
              Impostazioni
            </Button>
            <Button variant="ghost" icon={<Download size={20} />}>
              Ancora
            </Button>
          </Box>
        </Box>

        {/* LOADING STATE */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ color: 'text.primary', mb: 2, fontWeight: 700, fontSize: '1.5rem' }}>Loading State</Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            bgcolor: 'background.paper', 
            p: 3, 
            borderRadius: '30px', 
            border: `1px solid ${theme.palette.divider}` 
          }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                isLoading={loading}
                loadingLabel="Autenticazione..."
                onClick={handleClick}
              >
                Login
              </Button>
              <Button
                variant="secondary"
                isLoading={loading}
                loadingLabel="Salvataggio..."
                onClick={handleClick}
              >
                Salva
              </Button>
              <Button
                variant="danger"
                isLoading={loading}
                loadingLabel="Eliminazione..."
                onClick={handleClick}
              >
                Elimina
              </Button>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              Clicca un bottone per simulare lo stato di caricamento (2 secondi)
            </Typography>
          </Box>
        </Box>

        {/* STATI DISABLED */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ color: 'text.primary', mb: 2, fontWeight: 700, fontSize: '1.5rem' }}>Stati Disabled</Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
            gap: 3, 
            bgcolor: 'background.paper', 
            p: 3, 
            borderRadius: '30px', 
            border: `1px solid ${theme.palette.divider}` 
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Primary Disabled</Typography>
              <Button variant="primary" disabled>
                Disabilitato
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Secondary Disabled</Typography>
              <Button variant="secondary" disabled>
                Disabilitato
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Glass Disabled</Typography>
              <Button variant="glass" disabled>
                Disabilitato
              </Button>
            </Box>
          </Box>
        </Box>

        {/* FULL WIDTH */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ color: 'text.primary', mb: 2, fontWeight: 700, fontSize: '1.5rem' }}>Full Width</Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            bgcolor: 'background.paper', 
            p: 3, 
            borderRadius: '30px', 
            border: `1px solid ${theme.palette.divider}` 
          }}>
            <Button variant="primary" fullWidth>
              Full Width Primary Button
            </Button>
            <Button variant="secondary" fullWidth>
              Full Width Secondary Button
            </Button>
          </Box>
        </Box>

        {/* UTILIZZO NEL CODICE */}
        <Box>
          <Typography variant="h2" sx={{ color: 'text.primary', mb: 2, fontWeight: 700, fontSize: '1.5rem' }}>Come Usarlo</Typography>
          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 3, 
            borderRadius: '30px', 
            border: `1px solid ${theme.palette.divider}`, 
            overflowX: 'auto' 
          }}>
            <Box component="pre" sx={{ color: 'text.secondary', fontSize: '0.875rem', fontFamily: 'monospace', m: 0 }}>
              {`import Button from '@/components/ui/Button';
import { Heart } from 'lucide-react';

// Basic usage
<Button>Click me</Button>

// Con variante
<Button variant="secondary">Annulla</Button>

// Con icon
<Button variant="primary" icon={<Heart size={20} />}>
  Like
</Button>

// Con loading state
<Button isLoading={loading} loadingLabel="Salvataggio...">
  Salva
</Button>

// Full width e custom className
<Button fullWidth variant="danger">
  Elimina
</Button>`}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}