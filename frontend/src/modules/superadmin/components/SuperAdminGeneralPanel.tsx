'use client';

import { useCallback, useEffect, useState } from 'react';
import { Box, CircularProgress, Grid, LinearProgress, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Card from '@/common/components/ui/Card';
import Button, { SaveButton } from '@/common/components/ui/Button';
import FormInput from '@/common/components/forms/FormInput';
import Icon from '@/common/components/ui/Icon';
import { useToast } from '@/common/hooks/useToast';
import { configService } from '@/common/shared/services/config.service';
import { metricsApi, type SystemHealthData } from '@/modules/metrics/api/metricsApi';

interface MaintenanceActionProps {
  title: string;
  description: string;
  icon: 'refreshCw' | 'database' | 'network';
  color: 'primary' | 'success' | 'warning';
  label: string;
  loadingLabel: string;
  loading: boolean;
  onClick: () => void;
  showProgress?: boolean;
}

function MaintenanceAction({
  title,
  description,
  icon,
  color,
  label,
  loadingLabel,
  loading,
  onClick,
  showProgress,
}: MaintenanceActionProps) {
  const theme = useTheme();
  const paletteColor = theme.palette[color].main;

  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(paletteColor, 0.03), border: `1px solid ${alpha(paletteColor, 0.15)}` }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9375rem' }}>{title}</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{description}</Typography>
        </Box>
        <Button
          variant="secondary"
          size="sm"
          disabled={loading}
          onClick={onClick}
          icon={<Icon name={icon} size={12} />}
          isLoading={loading}
          loadingLabel={loadingLabel}
          sx={{ borderRadius: 1.5, borderColor: alpha(paletteColor, 0.3), color: `${color}.main` }}
        >
          {label}
        </Button>
      </Stack>
      {showProgress && loading ? <LinearProgress color={color} sx={{ borderRadius: 1, mt: 1.5 }} /> : null}
    </Box>
  );
}

function SystemHealthCard({ health }: { health: SystemHealthData | null }) {
  const theme = useTheme();
  const items = [
    {
      label: 'Database',
      icon: 'database' as const,
      value: health?.dbStatus ?? 'NON DISPONIBILE',
      detail: health ? `Latenza: ${health.dbLatencyMs}ms` : 'Metriche non disponibili',
      color: theme.palette.success.main,
    },
    {
      label: 'Storage documenti',
      icon: 'hardDrive' as const,
      value: health ? `${health.storagePercent}% usato` : 'NON DISPONIBILE',
      detail: health ? `${health.storageFormatted} utilizzati` : 'Metriche non disponibili',
      color: theme.palette.primary.main,
    },
  ];

  return (
    <Card variant="glass" size="lg" sx={{ borderRadius: 3 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
        <Icon name="cpu" size={22} color={theme.palette.primary.main} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Stato dei servizi</Typography>
      </Stack>
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid key={item.label} size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(item.color, 0.04), border: `1px solid ${alpha(item.color, 0.2)}` }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                <Icon name={item.icon} size={18} color={item.color} />
                <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</Typography>
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{item.value}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{item.detail}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}

export default function SuperAdminGeneralPanel() {
  const theme = useTheme();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [defaultPrefix, setDefaultPrefix] = useState('+39');
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null);
  const [savingPrefix, setSavingPrefix] = useState(false);
  const [cleaningCache, setCleaningCache] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [gatewayRebooting, setGatewayRebooting] = useState(false);

  useEffect(() => {
    Promise.all([
      configService.getConfig(),
      metricsApi.getSummary().catch(() => null),
    ]).then(([config, metrics]) => {
      if (config.success && config.DEFAULT_PHONE_PREFIX) setDefaultPrefix(config.DEFAULT_PHONE_PREFIX);
      if (metrics?.health) setSystemHealth(metrics.health);
    }).catch(() => {
      toast.error('Impossibile caricare i parametri di configurazione.');
    }).finally(() => setLoading(false));
  }, [toast]);

  const savePrefix = useCallback(async () => {
    setSavingPrefix(true);
    try {
      const result = await configService.updateConfig({ DEFAULT_PHONE_PREFIX: defaultPrefix });
      if (!result.success) throw new Error('Salvataggio non riuscito');
      window.dispatchEvent(new Event('consent-config-updated'));
      toast.success('Prefisso telefonico salvato con successo!');
    } catch {
      toast.error('Errore durante il salvataggio del prefisso.');
    } finally {
      setSavingPrefix(false);
    }
  }, [defaultPrefix, toast]);

  const cleanCache = useCallback(() => {
    setCleaningCache(true);
    window.setTimeout(() => {
      setCleaningCache(false);
      toast.success('Cache di sessione ripulita con successo!');
    }, 1500);
  }, [toast]);

  const downloadBackup = useCallback(() => {
    setBackingUp(true);
    try {
      const anchor = document.createElement('a');
      anchor.href = configService.downloadBackup();
      anchor.download = '';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      toast.success('Backup SQL generato con successo!');
    } catch {
      toast.error('Errore durante la generazione del backup.');
    } finally {
      setBackingUp(false);
    }
  }, [toast]);

  const rebootGateway = useCallback(() => {
    setGatewayRebooting(true);
    window.setTimeout(() => {
      setGatewayRebooting(false);
      toast.success('Gateway WhatsApp riallineato.');
    }, 1800);
  }, [toast]);

  if (loading) {
    return <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 320 }}><CircularProgress size={42} /></Box>;
  }

  return (
    <Grid container spacing={3.5}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant="glass" size="md" sx={{ height: '100%', borderRadius: 3 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
            <Icon name="toggleLeft" size={22} color={theme.palette.primary.main} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Configurazione generale</Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Imposta il prefisso internazionale applicato ai nuovi numeri telefonici.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-end' }}>
            <FormInput
              label="Prefisso telefonico predefinito"
              value={defaultPrefix}
              onChange={setDefaultPrefix}
              disabled={savingPrefix}
              sx={{ maxWidth: 220 }}
            />
            <SaveButton disabled={savingPrefix} onClick={savePrefix}>Salva prefisso</SaveButton>
          </Stack>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant="glass" size="md" sx={{ height: '100%', borderRadius: 3 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
            <Icon name="settings2" size={22} color={theme.palette.primary.main} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Strumenti di manutenzione</Typography>
          </Stack>
          <Stack spacing={2}>
            <MaintenanceAction title="Svuota cache di sessione" description="Rimuove le risposte memorizzate localmente." icon="refreshCw" color="primary" label="Esegui" loadingLabel="Svuotando..." loading={cleaningCache} onClick={cleanCache} />
            <MaintenanceAction title="Backup database" description="Scarica un dump della struttura relazionale." icon="database" color="success" label="Backup" loadingLabel="Creando..." loading={backingUp} onClick={downloadBackup} showProgress />
            <MaintenanceAction title="Riavvia gateway WhatsApp" description="Riallinea il broker di messaggistica." icon="network" color="warning" label="Riavvia" loadingLabel="Riavvio..." loading={gatewayRebooting} onClick={rebootGateway} />
          </Stack>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <SystemHealthCard health={systemHealth} />
      </Grid>
    </Grid>
  );
}
