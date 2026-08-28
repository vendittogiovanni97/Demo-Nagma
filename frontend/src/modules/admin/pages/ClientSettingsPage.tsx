'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SaveButton } from '@/common/components/ui/Button';
import { useClientConfig, useUpdateClientConfig, ClientConfig } from '@/common/hooks/useClientConfig';
import { useToast } from '@/common/hooks/useToast';
import { useAuth } from '@/common/context/AuthContext';
import { inputSx } from '@/common/theme/inputStyles';
import { DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR } from '@/common/theme/colorTokens';

/**
 * Admin Settings Page — Configurazione client
 * SUPER_ADMIN only
 */
export default function ClientSettingsPage() {
  const theme = useTheme();
  const { isSuperAdmin } = useAuth();
  const { clientConfig, isLoading } = useClientConfig();
  const { updateConfig } = useUpdateClientConfig();
  const toast = useToast();

  const [formData, setFormData] = useState<Partial<ClientConfig>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initializza form con clientConfig
  useEffect(() => {
    if (clientConfig) {
      setFormData({
        clientName: clientConfig.clientName,
        clientLogoUrl: clientConfig.clientLogoUrl,
        clientTimeZone: clientConfig.clientTimeZone,
        clientLocale: clientConfig.clientLocale,
        primaryColor: clientConfig.primaryColor,
        secondaryColor: clientConfig.secondaryColor,
        features: clientConfig.features,
        maxUsers: clientConfig.maxUsers,
        maxBookings: clientConfig.maxBookings,
        maxAttachmentSizeMB: clientConfig.maxAttachmentSizeMB,
        apiRateLimitPerMinute: clientConfig.apiRateLimitPerMinute,
      });
    }
  }, [clientConfig]);

  if (!isSuperAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Accesso negato. Solo SUPER_ADMIN può accedere a questa pagina.</Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleChange = (field: keyof ClientConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureToggle = (featureName: keyof ClientConfig['features'], enabled: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...(prev.features || {} as ClientConfig['features']),
        [featureName]: enabled,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload: any = { ...formData };
      await updateConfig(payload);
      toast.success('Configurazione salvata con successo');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Errore durante il salvataggio della configurazione');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Impostazioni Client
      </Typography>

      <Grid container spacing={3}>
        {/* Branding Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Branding" />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Nome Client"
                  value={formData.clientName || ''}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  fullWidth
                  size="small"
                  sx={inputSx(theme)}
                />
                <TextField
                  label="Logo URL"
                  value={formData.clientLogoUrl || ''}
                  onChange={(e) => handleChange('clientLogoUrl', e.target.value)}
                  fullWidth
                  size="small"
                  helperText="URL pubblico del logo"
                  sx={inputSx(theme)}
                />
                <Box>
                  <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600, color: 'text.secondary' }}>
                    Colore Primario
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={formData.primaryColor || DEFAULT_PRIMARY_COLOR}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      style={{
                        width: 48,
                        height: 40,
                        cursor: 'pointer',
                        borderRadius: 8,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: 'transparent',
                      }}
                    />
                    <TextField
                      value={formData.primaryColor || DEFAULT_PRIMARY_COLOR}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      size="small"
                      sx={{ flex: 1, ...inputSx(theme) }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600, color: 'text.secondary' }}>
                    Colore Secondario
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={formData.secondaryColor || DEFAULT_SECONDARY_COLOR}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      style={{
                        width: 48,
                        height: 40,
                        cursor: 'pointer',
                        borderRadius: 8,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: 'transparent',
                      }}
                    />
                    <TextField
                      value={formData.secondaryColor || DEFAULT_SECONDARY_COLOR}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      size="small"
                      sx={{ flex: 1, ...inputSx(theme) }}
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Localization Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Localizzazione" />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Timezone"
                  value={formData.clientTimeZone || 'Europe/Rome'}
                  onChange={(e) => handleChange('clientTimeZone', e.target.value)}
                  fullWidth
                  size="small"
                  helperText="es: Europe/Rome, America/New_York"
                  sx={inputSx(theme)}
                />
                <TextField
                  label="Locale"
                  value={formData.clientLocale || 'it-IT'}
                  onChange={(e) => handleChange('clientLocale', e.target.value)}
                  fullWidth
                  size="small"
                  helperText="es: it-IT, en-US, fr-FR"
                  sx={inputSx(theme)}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Feature Flags Section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title="Feature Flags" />
            <CardContent>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.features?.enableCream ?? true}
                      onChange={(e) => handleFeatureToggle('enableCream', e.target.checked)}
                    />
                  }
                  label="Abilita Modulo Creme"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.features?.enableWhatsApp ?? true}
                      onChange={(e) => handleFeatureToggle('enableWhatsApp', e.target.checked)}
                    />
                  }
                  label="Abilita Modulo WhatsApp"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.features?.enableFormTemplate ?? true}
                      onChange={(e) => handleFeatureToggle('enableFormTemplate', e.target.checked)}
                    />
                  }
                  label="Abilita Modulo Form Template"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.features?.enableConfig ?? true}
                      onChange={(e) => handleFeatureToggle('enableConfig', e.target.checked)}
                    />
                  }
                  label="Abilita Modulo Config"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Limits Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Limiti Utenti" />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Max Utenti"
                  type="number"
                  value={formData.maxUsers || 100}
                  onChange={(e) => handleChange('maxUsers', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  sx={inputSx(theme)}
                />
                <TextField
                  label="Max Prenotazioni"
                  type="number"
                  value={formData.maxBookings || 1000}
                  onChange={(e) => handleChange('maxBookings', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  sx={inputSx(theme)}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* API Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Configurazione API" />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Max Allegati (MB)"
                  type="number"
                  value={formData.maxAttachmentSizeMB || 50}
                  onChange={(e) => handleChange('maxAttachmentSizeMB', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  sx={inputSx(theme)}
                />
                <TextField
                  label="Rate Limit (req/min)"
                  type="number"
                  value={formData.apiRateLimitPerMinute || 60}
                  onChange={(e) => handleChange('apiRateLimitPerMinute', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  sx={inputSx(theme)}
                />
                <TextField
                  label="Password Modifica Prenotazioni"
                  type="password"
                  value={formData.bookingUpdatePassword || ''}
                  onChange={(e) => handleChange('bookingUpdatePassword', e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Lasciare vuoto per non modificare"
                  sx={inputSx(theme)}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <SaveButton
              onClick={handleSave}
              disabled={isSaving}
              isLoading={isSaving}
              loadingLabel="Salvataggio..."
            >
              Salva Configurazione
            </SaveButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
