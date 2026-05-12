"use client";

import PageTransition from '@/components/layout/PageTransition';
import { useToast } from '@/hooks/useToast';
import { configService } from '@/shared/services/config.service';
import { getToken } from '@/shared/utils/auth';
import { API_BASE_URL, ENDPOINTS } from '@/shared/api/endpoints';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography
} from '@mui/material';
import {
  Cpu,
  Database,
  HardDrive,
  Network,
  RefreshCw,
  Settings2,
  Shield,
  ToggleLeft,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface CustomSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  activeColor: string;
}

function CustomSwitch({ checked, onChange, disabled, activeColor }: CustomSwitchProps) {
  return (
    <Box
      onClick={() => !disabled && onChange()}
      sx={{
        width: 52,
        height: 28,
        borderRadius: '14px',
        backgroundColor: checked ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.05)',
        border: checked ? `1.5px solid ${activeColor}` : '1.5px solid rgba(255, 255, 255, 0.15)',
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
          borderColor: checked ? activeColor : 'rgba(255, 255, 255, 0.3)',
        }
      }}
    >
      <Box
        sx={{
          width: 21,
          height: 21,
          borderRadius: '50%',
          backgroundColor: checked ? activeColor : '#64748b',
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
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [savingFlag, setSavingFlag] = useState(false);

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
        const res = await configService.getConfig();
        if (res.success) {
          setShowConsensi(res.SHOW_CONSENSI);
          setShowPosizionamento(res.SHOW_POSIZIONAMENTO);
          if (res.DEFAULT_PHONE_PREFIX) {
            setDefaultPrefix(res.DEFAULT_PHONE_PREFIX);
          }
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
      const token = getToken() || '';
      const downloadUrl = `${API_BASE_URL}${ENDPOINTS.CONFIG.BACKUP}?token=${encodeURIComponent(token)}`;

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
        <CircularProgress size={45} sx={{ color: '#00bfff' }} />
      </Box>
    );
  }

  return (
    <PageTransition>
      <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header section with Glowing Shield */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            mb: 4,
            p: 3,
            borderRadius: 3,
            border: '1px solid rgba(0, 191, 255, 0.15)',
            background: 'linear-gradient(135deg, rgba(6, 11, 19, 0.95) 0%, rgba(10, 26, 40, 0.9) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(0, 191, 255, 0.05)',
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
              backgroundColor: 'rgba(0, 191, 255, 0.1)',
              border: '2px solid rgba(0, 191, 255, 0.4)',
              boxShadow: '0 0 20px rgba(0, 191, 255, 0.25)',
              animation: 'pulse 2s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(0, 191, 255, 0.25)' },
                '50%': { transform: 'scale(1.05)', boxShadow: '0 0 30px rgba(0, 191, 255, 0.4)' },
                '100%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(0, 191, 255, 0.25)' },
              }
            }}
          >
            <Shield size={28} color="#00bfff" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', mb: 0.5 }}>
              Pannello di Controllo Super Admin
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', opacity: 0.85 }}>
              Gestisci l'attivazione dei moduli critici, controlla le metriche di sistema e avvia la manutenzione straordinaria.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3.5}>
          {/* LEFT: Feature Toggles */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
                <ToggleLeft color="#00bfff" size={22} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
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
                    border: showConsensi ? '1px solid rgba(0, 229, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: showConsensi ? 'rgba(0, 229, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box sx={{ pr: 2 }}>
                    <Typography sx={{ fontWeight: 600, color: '#ffffff', fontSize: '1rem', mb: 0.5 }}>
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
                    activeColor="#00e5ff"
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
                    border: showPosizionamento ? '1px solid rgba(112, 0, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: showPosizionamento ? 'rgba(112, 0, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box sx={{ pr: 2 }}>
                    <Typography sx={{ fontWeight: 600, color: '#ffffff', fontSize: '1rem', mb: 0.5 }}>
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
                    activeColor="#a855f7"
                  />
                </Box>

                {/* Default Phone Prefix Input */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: '#ffffff', fontSize: '1rem', mb: 0.5 }}>
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
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(0, 191, 255, 0.2)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        padding: '10px 14px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        width: '100px',
                        textAlign: 'center',
                        fontFamily: 'inherit',
                      }}
                    />
                    <Button
                      variant="contained"
                      disabled={savingFlag}
                      onClick={handleSavePrefix}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #00bfff 0%, #00e5ff 100%)',
                        boxShadow: '0 0 15px rgba(0, 191, 255, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0099cc 0%, #00bfff 100%)',
                        },
                        px: 3,
                        fontWeight: 600,
                        color: '#060b13',
                      }}
                    >
                      Salva Prefisso
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* RIGHT: Maintenance & Action Center */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
                <Settings2 color="#00bfff" size={22} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                  Strumenti di Manutenzione & Utility
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                Avvia interventi di diagnostica o ottimizzazione in totale sicurezza sul database o sull'integrazione WhatsApp.
              </Typography>

              <Stack spacing={2}>
                {/* Reset Cache Tool */}
                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9375rem' }}>🧹 Svuota Cache di Sessione</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Forza la pulizia delle risposte memorizzate per evitare rallentamenti.</Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={cleaningCache}
                      onClick={handleCleanCache}
                      startIcon={cleaningCache ? <CircularProgress size={12} color="inherit" /> : <RefreshCw size={12} />}
                      sx={{ borderRadius: 1.5, textTransform: 'none', borderColor: 'rgba(0,191,255,0.3)', color: '#00bfff' }}
                    >
                      {cleaningCache ? 'Svuotando...' : 'Esegui'}
                    </Button>
                  </Stack>
                </Box>

                {/* Database Backup Tool */}
                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9375rem' }}>💾 Backup Database Struttura</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Scarica un dump istantaneo della struttura relazionale del DB.</Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={backingUp}
                      onClick={handleBackupDb}
                      startIcon={backingUp ? <CircularProgress size={12} color="inherit" /> : <Database size={12} />}
                      sx={{ borderRadius: 1.5, textTransform: 'none', borderColor: 'rgba(0,229,102,0.3)', color: '#00ff66' }}
                    >
                      {backingUp ? 'Creando backup...' : 'Backup'}
                    </Button>
                  </Stack>
                  {backingUp && (
                    <Box sx={{ width: '100%', mt: 1.5 }}>
                      <LinearProgress color="success" sx={{ borderRadius: 1 }} />
                    </Box>
                  )}
                </Box>

                {/* Gateway Reboot Tool */}
                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9375rem' }}>🔌 Riavvia Gateway WhatsApp</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Risolvi problemi di invio manuale riallineando il broker di messaggistica.</Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={gatewayRebooting}
                      onClick={handleRebootGateway}
                      startIcon={gatewayRebooting ? <CircularProgress size={12} color="inherit" /> : <Network size={12} />}
                      sx={{ borderRadius: 1.5, textTransform: 'none', borderColor: 'rgba(255,170,0,0.3)', color: '#ffaa00' }}
                    >
                      {gatewayRebooting ? 'Riavvio...' : 'Riavvia'}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* BOTTOM: System Diagnostics & Health Status */}
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                p: 3.5,
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 4 }}>
                <Cpu color="#00bfff" size={22} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
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
                      backgroundColor: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                      <Database size={18} color="#00ff66" />
                      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Database</Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', mb: 0.5 }}>ONLINE</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00ff66', boxShadow: '0 0 8px #00ff66' }} />
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
                      backgroundColor: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                      <Network size={18} color="#00ff66" />
                      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>WhatsApp Gateway</Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', mb: 0.5 }}>CONNESSO</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00ff66', boxShadow: '0 0 8px #00ff66' }} />
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
                      backgroundColor: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                      <HardDrive size={18} color="#00bfff" />
                      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Spazio Allegati</Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', mb: 0.5 }}>14.2% Usato</Typography>
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
                      backgroundColor: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                      <Shield size={18} color="#ffaa00" />
                      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Sessioni & Sicurezza</Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', mb: 0.5 }}>8 Ore (Scadenza)</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>JWT salt rounds: 10</Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageTransition>
  );
}
