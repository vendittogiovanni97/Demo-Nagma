'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { usePreferences } from '@/common/context/PreferencesContext';
import { useToast } from '@/common/hooks/useToast';
import Icon from '@/common/components/ui/Icon';

export default function UserSettingsPage() {
  const { preferences, updatePreferences, isLoading } = usePreferences();
  const toast = useToast();

  const [formState, setFormState] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormState(preferences);
  }, [preferences]);

  const handleChange = (field: keyof typeof preferences, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updatePreferences(formState);
      toast.success('Impostazioni salvate con successo!');
    } catch (err: any) {
      toast.error(err.message || 'Errore durante il salvataggio delle impostazioni');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormState(preferences);
    toast.success('Ripristinate le impostazioni correnti');
  };

  if (isLoading && !formState) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 900, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            bgcolor: 'primary.main',
            color: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="impostazioni" size={24} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Impostazioni Utente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Personalizza lingua, visualizzazione date, paginazione e notifiche
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSave}>
        {/* Sezione 1: Generale & Lingua */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Icon name="globe" size={20} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                Generale & Lingua
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="language-label">Lingua Piattaforma</InputLabel>
                  <Select
                    labelId="language-label"
                    value={formState.language}
                    label="Lingua Piattaforma"
                    onChange={(e) => handleChange('language', e.target.value)}
                  >
                    <MenuItem value="it">Italiano (IT)</MenuItem>
                    <MenuItem value="en">English (EN)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="timezone-label">Fuso Orario (Timezone)</InputLabel>
                  <Select
                    labelId="timezone-label"
                    value={formState.timezone}
                    label="Fuso Orario (Timezone)"
                    onChange={(e) => handleChange('timezone', e.target.value)}
                  >
                    <MenuItem value="Europe/Rome">Europe/Rome (GMT+1/GMT+2)</MenuItem>
                    <MenuItem value="UTC">UTC (GMT+0)</MenuItem>
                    <MenuItem value="Europe/London">Europe/London (GMT+0)</MenuItem>
                    <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                    <MenuItem value="Asia/Tokyo">Asia/Tokyo (JST)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Sezione 2: Visualizzazione & Griglie */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Icon name="colonne" size={20} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                Visualizzazione & Tabelle
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="dateformat-label">Formato Date Visualizzato</InputLabel>
                  <Select
                    labelId="dateformat-label"
                    value={formState.dateFormat}
                    label="Formato Date Visualizzato"
                    onChange={(e) => handleChange('dateFormat', e.target.value)}
                  >
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (es. 20/07/2026)</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (es. 07/20/2026)</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (es. 2026-07-20)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="itemsperpage-label">Elementi Predefiniti per Pagina</InputLabel>
                  <Select
                    labelId="itemsperpage-label"
                    value={formState.itemsPerPage}
                    label="Elementi Predefiniti per Pagina"
                    onChange={(e) => handleChange('itemsPerPage', Number(e.target.value))}
                  >
                    <MenuItem value={10}>10 righe per pagina</MenuItem>
                    <MenuItem value={25}>25 righe per pagina (Consigliato)</MenuItem>
                    <MenuItem value={50}>50 righe per pagina</MenuItem>
                    <MenuItem value={100}>100 righe per pagina</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Sezione 3: Notifiche */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Icon name="messaggio" size={20} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                Preferenze Notifiche
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formState.emailNotifications}
                      onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Notifiche via Email per aggiornamenti prenotazioni"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formState.inAppNotifications}
                      onChange={(e) => handleChange('inAppNotifications', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Notifiche in-app e messaggi di sistema"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Form Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleReset}
            disabled={isSaving}
            sx={{ minHeight: 44, px: 3 }}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={18} /> : <Icon name="check" size={18} />}
            sx={{ minHeight: 44, px: 4, fontWeight: 700 }}
          >
            {isSaving ? 'Salvataggio...' : 'Salva Impostazioni'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
