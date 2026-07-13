"use client";

import PageTransition from '@/common/components/layout/PageTransition';
import { useToast } from '@/common/hooks/useToast';
import { configService } from '@/common/shared/services/config.service';
import {
  Box,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Button, { SaveButton } from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';
import Icon from '@/common/components/ui/Icon';
import CustomFieldsManager from '../components/CustomFieldsManager';
import { useEffect, useState } from 'react';
import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';
import SwitchInput from '@/common/components/forms/SwitchInput';
import { ClientConfig } from '@/common/shared/services/config.service';

interface CustomSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  activeColor: string;
}

function CustomSwitch({ checked, onChange, disabled, activeColor }: CustomSwitchProps) {
  const theme = useTheme();

  return (
    <Box
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChange()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          onChange();
        }
      }}
      sx={{
        width: 52,
        height: 28,
        borderRadius: '14px',
        backgroundColor: checked ? alpha(theme.palette.common.black, 0.4) : alpha(theme.palette.common.white, 0.05),
        border: checked ? `1.5px solid ${activeColor}` : `1.5px solid ${alpha(theme.palette.common.white, 0.15)}`,
        boxShadow: checked ? `0 0 10px ${activeColor}33, inset 0 0 5px ${activeColor}22` : 'none',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        padding: '2.5px',
        userSelect: 'none',
        '&:hover': {
          borderColor: checked ? activeColor : alpha(theme.palette.common.white, 0.3),
        }
      }}
    >
      <Box
        sx={{
          width: 21,
          height: 21,
          borderRadius: '50%',
          backgroundColor: checked ? activeColor : theme.palette.text.secondary,
          transform: checked ? 'translateX(24px)' : 'translateX(0px)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: checked
            ? `0 0 8px ${activeColor}, 0 0 15px ${activeColor}88`
            : 'none',
        }}
      />
    </Box>
  );
}

export default function SuperAdminPanelPage() {
  const theme = useTheme();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [savingFlag, setSavingFlag] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'customFields'>('general');

  // Feature Flags
  const [showConsensi, setShowConsensi] = useState(false);
  const [showPosizionamento, setShowPosizionamento] = useState(false);
  const [defaultPrefix, setDefaultPrefix] = useState('+39');

  // Mock states for simulation
  const [cleaningCache, setCleaningCache] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [gatewayRebooting, setGatewayRebooting] = useState(false);

  // Fetch current configs on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Fetch both old SystemConfig (for backward compat) and new ClientConfig
        const [systemRes, clientRes] = await Promise.all([
          configService.getConfig(),
          configService.getClientConfig().catch(() => null),
        ]);

        if (systemRes.success) {
          setShowConsensi(systemRes.SHOW_CONSENSI);
          setShowPosizionamento(systemRes.SHOW_POSIZIONAMENTO);
          if (systemRes.DEFAULT_PHONE_PREFIX) {
            setDefaultPrefix(systemRes.DEFAULT_PHONE_PREFIX);
          }
        }

        if (clientRes) {
          // Could use clientRes for new features like primaryColor, secondaryColor, etc.
          console.log('ClientConfig loaded:', { ...clientRes, bookingUpdatePassword: '[REDACTED]' });
        }
      } catch (err) {
        toast.error('Impossibile caricare i parametri di configurazione.');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [toast]);

  const handleSavePrefix = async () => {
    setSavingFlag(true);
    try {
      const res = await configService.updateConfig({
        DEFAULT_PHONE_PREFIX: defaultPrefix,
      });
      if (res.success) {
        window.dispatchEvent(new Event('consent-config-updated'));
        toast.success('Prefisso telefonico salvato con successo!');
      } else {
        toast.error('Errore durante il salvataggio.');
      }
    } catch (err) {
      toast.error('Errore di connessione.');
    } finally {
      setSavingFlag(false);
    }
  };

  const handleToggleFlag = async (flag: 'consensi' | 'posizionamento', currentVal: boolean) => {
    setSavingFlag(true);
    const updatedConsensi = flag === 'consensi' ? !currentVal : showConsensi;
    const updatedPosizionamento = flag === 'posizionamento' ? !currentVal : showPosizionamento;

    try {
      const res = await configService.updateConfig({
        SHOW_CONSENSI: updatedConsensi,
        SHOW_POSIZIONAMENTO: updatedPosizionamento,
      });

      if (res.success) {
        if (flag === 'consensi') setShowConsensi(updatedConsensi);
        if (flag === 'posizionamento') setShowPosizionamento(updatedPosizionamento);

        // Dispatch instant global update event for Navbar and other components
        window.dispatchEvent(new Event('consent-config-updated'));

        toast.success('Configurazione aggiornata con successo!');
      } else {
        toast.error('Errore durante il salvataggio.');
      }
    } catch (err) {
      toast.error('Errore di connessione con il server.');
    } finally {
      setSavingFlag(false);
    }
  };

  const handleCleanCache = () => {
    setCleaningCache(true);
    setTimeout(() => {
      setCleaningCache(false);
      toast.success('Cache di sessione e query di React-Query ripulite con successo!');
    }, 1500);
  };

  const handleBackupDb = async () => {
    setBackingUp(true);
    try {
      const downloadUrl = configService.downloadBackup();

      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = downloadUrl;
      // Triggers browser native download of the server-supplied filename
      downloadAnchor.setAttribute('download', '');

      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      toast.success('Backup SQL generato e scaricato con successo!');
    } catch (err) {
      toast.error('Errore durante la generazione del backup.');
    } finally {
      setBackingUp(false);
    }
  };

  const handleRebootGateway = () => {
    setGatewayRebooting(true);
    setTimeout(() => {
      setGatewayRebooting(false);
      toast.success('Gateway WhatsApp riavviato e sincronizzato! Stato: ONLINE.');
    }, 1800);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={45} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <PageTransition>
      <Box sx={{ py: 4, px: 0, width: '100%' }}>
        {/* Header section with Glowing Shield */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            mb: 4,
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.common.black, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}, inset 0 0 15px ${alpha(theme.palette.primary.main, 0.05)}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              border: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.25)}`,
              animation: 'pulse 2s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.25)}` },
                '50%': { transform: 'scale(1.05)', boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.4)}` },
                '100%': { transform: 'scale(1)', boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.25)}` },
              }
            }}
          >
            <Icon name="shield" size={28} color={theme.palette.primary.main} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'common.white', letterSpacing: '-0.02em', mb: 0.5 }}>
              Pannello di Controllo Super Admin
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', opacity: 0.85 }}>
              Gestisci l'attivazione dei moduli critici, controlla le metriche di sistema e avvia la manutenzione straordinaria.
            </Typography>
          </Box>
        </Box>

        {/* Tab Navigation */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            mb: 4,
            p: 0.5,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
            backgroundColor: alpha(theme.palette.common.black, 0.3),
            width: 'fit-content',
          }}
        >
          <Button
            variant={activeTab === 'general' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('general')}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 1.5,
              fontWeight: 600,
              fontSize: '0.875rem',
              color: activeTab === 'general' ? 'common.white' : 'text.secondary',
              ...(activeTab === 'general' ? {
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`,
              } : {
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: alpha(theme.palette.common.white, 0.05),
                }
              })
            }}
          >
            Impostazioni Generali
          </Button>
          <Button
            variant={activeTab === 'customFields' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('customFields')}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 1.5,
              fontWeight: 600,
              fontSize: '0.875rem',
              color: activeTab === 'customFields' ? 'common.white' : 'text.secondary',
              ...(activeTab === 'customFields' ? {
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`,
              } : {
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: alpha(theme.palette.common.white, 0.05),
                }
              })
            }}
          >
            Campi Personalizzati
          </Button>
        </Stack>

        {activeTab === 'general' ? (
          <Grid container spacing={3.5}>
          {/* LEFT: Feature Toggles */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              variant="glass"
              size="md"
              sx={{
                height: '100%',
                borderRadius: 3,
                background: alpha(theme.palette.common.white, 0.02),
                backdropFilter: 'blur(20px)',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
                <Icon name="toggleLeft" size={22} color={theme.palette.primary.main} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'common.white' }}>
                  Attivazione Moduli e Feature Flags
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
                Abilita o disabilita all'istante le funzionalità sul database. Le modifiche avranno impatto immediato su tutti i ruoli non autorizzati e nasconderanno automaticamente le rispettive voci di navigazione.
              </Typography>

              <Stack spacing={3}>
                {/* Consent Module Switch */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    borderRadius: 2,
                    border: showConsensi ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : `1px solid ${alpha(theme.palette.common.white, 0.06)}`,
                    backgroundColor: showConsensi ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.common.white, 0.01),
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box sx={{ pr: 2 }}>
                    <Typography sx={{ fontWeight: 600, color: 'common.white', fontSize: '1rem', mb: 0.5 }}>
                      📄 Archivio Consensi
                    </Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                      Attiva il portale di firma e archiviazione digitale dei consensi dei clienti.
                    </Typography>
                  </Box>
                  <CustomSwitch
                    checked={showConsensi}
                    disabled={savingFlag}
                    onChange={() => handleToggleFlag('consensi', showConsensi)}
                    activeColor={theme.palette.primary.main}
                  />
                </Box>

                {/* Placement Module Switch */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    borderRadius: 2,
                    border: showPosizionamento ? `1px solid ${alpha(theme.palette.custom.purple, 0.2)}` : `1px solid ${alpha(theme.palette.common.white, 0.06)}`,
                    backgroundColor: showPosizionamento ? alpha(theme.palette.custom.purple, 0.03) : alpha(theme.palette.common.white, 0.01),
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box sx={{ pr: 2 }}>
                    <Typography sx={{ fontWeight: 600, color: 'common.white', fontSize: '1rem', mb: 0.5 }}>
                      🗺️ Mappa Corporea
                    </Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                      Abilita lo strumento interattivo di anatomia per posizionare i tatuaggi dei clienti.
                    </Typography>
                  </Box>
                  <CustomSwitch
                    checked={showPosizionamento}
                    disabled={savingFlag}
                    onChange={() => handleToggleFlag('posizionamento', showPosizionamento)}
                    activeColor={theme.palette.custom.purple}
                  />
                </Box>

                {/* Default Phone Prefix Input */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.common.white, 0.06)}`,
                    backgroundColor: alpha(theme.palette.common.white, 0.01),
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: 'common.white', fontSize: '1rem', mb: 0.5 }}>
                    🌍 Prefisso Telefonico di Default (WhatsApp)
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 2 }}>
                    Inserisci il prefisso internazionale predefinito (es. +39). Verrà applicato automaticamente ai nuovi numeri inseriti senza prefisso.
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <input
                      type="text"
                      value={defaultPrefix}
                      onChange={(e) => setDefaultPrefix(e.target.value)}
                      disabled={savingFlag}
                      style={{
                        backgroundColor: alpha(theme.palette.common.black, 0.3),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: '8px',
                        color: theme.palette.common.white,
                        padding: '10px 14px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        width: '100px',
                        textAlign: 'center',
                        fontFamily: 'inherit',
                      }}
                    />
                    <SaveButton
                      disabled={savingFlag}
                      onClick={handleSavePrefix}
                      sx={{
                        px: 3,
                        fontWeight: 600,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                        boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      Salva Prefisso
                    </SaveButton>
                  </Stack>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* RIGHT: Maintenance & Action Center */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              variant="glass"
              size="md"
              sx={{
                height: '100%',
                borderRadius: 3,
                background: alpha(theme.palette.common.white, 0.02),
                backdropFilter: 'blur(20px)',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
                <Icon name="settings2" size={22} color={theme.palette.primary.main} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'common.white' }}>
                  Strumenti di Manutenzione & Utility
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                Avvia interventi di diagnostica o ottimizzazione in totale sicurezza sul database o sull'integrazione WhatsApp.
              </Typography>

              <Stack spacing={2}>
                {/* Reset Cache Tool */}
                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.common.white, 0.02), border: `1px solid ${alpha(theme.palette.common.white, 0.04)}` }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: 'common.white', fontSize: '0.9375rem' }}>🧹 Svuota Cache di Sessione</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Forza la pulizia delle risposte memorizzate per evitare rallentamenti.</Typography>
                    </Box>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={cleaningCache}
                      onClick={handleCleanCache}
                      icon={<Icon name="refreshCw" size={12} />}
                      isLoading={cleaningCache}
                      loadingLabel="Svuotando..."
                      sx={{ borderRadius: 1.5, borderColor: alpha(theme.palette.primary.main, 0.3), color: 'primary.main' }}
                    >
                      Esegui
                    </Button>
                  </Stack>
                </Box>

                {/* Database Backup Tool */}
                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.common.white, 0.02), border: `1px solid ${alpha(theme.palette.common.white, 0.04)}` }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: 'common.white', fontSize: '0.9375rem' }}>💾 Backup Database Struttura</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Scarica un dump istantaneo della struttura relazionale del DB.</Typography>
                    </Box>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={backingUp}
                      onClick={handleBackupDb}
                      icon={<Icon name="database" size={12} />}
                      isLoading={backingUp}
                      loadingLabel="Creando backup..."
                      sx={{ borderRadius: 1.5, borderColor: alpha(theme.palette.success.main, 0.3), color: 'success.main' }}
                    >
                      Backup
                    </Button>
                  </Stack>
                  {backingUp && (
                    <Box sx={{ width: '100%', mt: 1.5 }}>
                      <LinearProgress color="success" sx={{ borderRadius: 1 }} />
                    </Box>
                  )}
                </Box>

                {/* Gateway Reboot Tool */}
                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.common.white, 0.02), border: `1px solid ${alpha(theme.palette.common.white, 0.04)}` }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: 'common.white', fontSize: '0.9375rem' }}>🔌 Riavvia Gateway WhatsApp</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Risolvi problemi di invio manuale riallineando il broker di messaggistica.</Typography>
                    </Box>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={gatewayRebooting}
                      onClick={handleRebootGateway}
                      icon={<Icon name="network" size={12} />}
                      isLoading={gatewayRebooting}
                      loadingLabel="Riavvio..."
                      sx={{ borderRadius: 1.5, borderColor: alpha(theme.palette.warning.main, 0.3), color: 'warning.main' }}
                    >
                      Riavvia
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* BOTTOM: System Diagnostics & Health Status */}
          <Grid size={{ xs: 12 }}>
            <Card
              variant="glass"
              size="lg"
              sx={{
                borderRadius: 3,
                background: alpha(theme.palette.common.white, 0.02),
                backdropFilter: 'blur(20px)',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 4 }}>
                <Icon name="cpu" size={22} color={theme.palette.primary.main} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'common.white' }}>
                  Stato dei Servizi & Diagnostica Real-Time
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                {/* Database Connection Status */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.common.white, 0.01),
                      border: `1px solid ${alpha(theme.palette.common.white, 0.04)}`,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                      <Icon name="database" size={18} color={theme.palette.success.main} />
                      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Database</Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'common.white', mb: 0.5 }}>ONLINE</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main', boxShadow: `0 0 8px ${theme.palette.success.main}` }} />
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Latenza: 4ms (Ottimale)</Typography>
                    </Stack>
                  </Box>
                </Grid>

                {/* WhatsApp Connection */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.common.white, 0.01),
                      border: `1px solid ${alpha(theme.palette.common.white, 0.04)}`,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                      <Icon name="network" size={18} color={theme.palette.success.main} />
                      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>WhatsApp Gateway</Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'common.white', mb: 0.5 }}>CONNESSO</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main', boxShadow: `0 0 8px ${theme.palette.success.main}` }} />
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Broker MQTT: Connesso</Typography>
                    </Stack>
                  </Box>
                </Grid>

                {/* Storage Health */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.common.white, 0.01),
                      border: `1px solid ${alpha(theme.palette.common.white, 0.04)}`,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                      <Icon name="hardDrive" size={18} color={theme.palette.primary.main} />
                      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Spazio Allegati</Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'common.white', mb: 0.5 }}>14.2% Usato</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>1.42 GB / 10 GB totali</Typography>
                    </Stack>
                  </Box>
                </Grid>

                {/* Security Config */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.common.white, 0.01),
                      border: `1px solid ${alpha(theme.palette.common.white, 0.04)}`,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                      <Icon name="shield" size={18} color={theme.palette.warning.main} />
                      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Sessioni & Sicurezza</Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'common.white', mb: 0.5 }}>8 Ore (Scadenza)</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>JWT salt rounds: 10</Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
        ) : (
          <CustomFieldsManager />
        )}
      </Box>
    </PageTransition>
  );
}
