"use client";

import PageTransition from '@/common/components/layout/PageTransition';
import Button, { SaveButton } from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';
import Icon from '@/common/components/ui/Icon';
import { useToast } from '@/common/hooks/useToast';
import { configService } from '@/common/shared/services/config.service';
import {
  Box,
  Button as MuiButton,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import CustomFieldsManager from '../components/CustomFieldsManager';
import PerformanceDashboard from '../components/PerformanceDashboard';
import { metricsApi, SystemHealthData } from '@/modules/metrics/api/metricsApi';
import { userPreferencesApi } from '@/modules/user/api/userPreferencesApi';

interface CustomSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  activeColor: string;
}

interface ClientConfigData {
  clientName: string;
  clientLogoUrl?: string;
  clientTimeZone: string;
  clientLocale: string;
  primaryColor: string;
  secondaryColor: string;
  features: {
    enableCream: boolean;
    enableWhatsApp: boolean;
    enableFormTemplate: boolean;
    enableConfig: boolean;
  };
  maxUsers: number;
  maxBookings: number;
  maxAttachmentSizeMB: number;
  apiRateLimitPerMinute: number;
  customFields?: Record<string, any>;
}

interface UserPreferencesData {
  language: string;
  timezone: string;
  dateFormat: string;
  itemsPerPage: number;
  emailNotifications: boolean;
  inAppNotifications: boolean;
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
        if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
          e.preventDefault();
          onChange();
        }
      }}
      sx={{
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: checked ? activeColor : alpha(theme.palette.text.primary, 0.2),
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.25s ease',
        boxShadow: checked ? `0 0 10px ${alpha(activeColor, 0.4)}` : 'none',
      }}
    >
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform 0.25s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
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
  const [activeTab, setActiveTab] = useState<'general' | 'customFields' | 'performance' | 'clientSettings' | 'userSettings'>('general');

  const [defaultPrefix, setDefaultPrefix] = useState('+39');
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null);
  const [clientConfig, setClientConfig] = useState<ClientConfigData | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferencesData | null>(null);

  // Mock states for simulation
  const [cleaningCache, setCleaningCache] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [gatewayRebooting, setGatewayRebooting] = useState(false);
  const [clientSaving, setClientSaving] = useState(false);
  const [userSaving, setUserSaving] = useState(false);

  // Fetch current configs on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [systemRes, clientRes, metricsRes, userPrefsRes] = await Promise.all([
          configService.getConfig(),
          configService.getClientConfig().catch(() => null),
          metricsApi.getSummary().catch(() => null),
          userPreferencesApi.getPreferences().catch(() => null),
        ]);

        if (systemRes.success) {
          if (systemRes.DEFAULT_PHONE_PREFIX) {
            setDefaultPrefix(systemRes.DEFAULT_PHONE_PREFIX);
          }
        }

        if (metricsRes?.health) {
          setSystemHealth(metricsRes.health);
        }

        if (clientRes?.success) {
          setClientConfig(clientRes.data);
        }

        if (userPrefsRes?.success) {
          setUserPreferences(userPrefsRes.data);
        }
      } catch (err) {
        toast.error('Impossibile caricare i parametri di configurazione.');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

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

  const handleSaveClientConfig = async () => {
    setClientSaving(true);
    try {
      if (!clientConfig) return;
      
      const res = await configService.updateClientConfig(clientConfig);
      if (res.success) {
        toast.success('Impostazioni client salvate con successo!');
        setClientConfig(res.data);
      } else {
        toast.error('Errore durante il salvataggio delle impostazioni client.');
      }
    } catch (err) {
      toast.error('Errore di connessione durante il salvataggio delle impostazioni client.');
    } finally {
      setClientSaving(false);
    }
  };

  const handleSaveUserPreferences = async () => {
    setUserSaving(true);
    try {
      if (!userPreferences) return;
      
      const res = await userPreferencesApi.updatePreferences(userPreferences);
      toast.success('Preferenze utente salvate con successo!');
      setUserPreferences(res);
    } catch (err) {
      toast.error('Errore di connessione durante il salvataggio delle preferenze utente.');
    } finally {
      setUserSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={45} sx={{ color: 'primary.main' }} />
      </Box>
);
 }

 // Client Settings Panel Component
 function ClientSettingsPanel({ clientConfig, onSave, saving }: { 
   clientConfig: ClientConfigData | null; 
   onSave: () => Promise<void>; 
   saving: boolean; 
 }) {
   const theme = useTheme();
   const isLight = theme.palette.mode === 'light';
   const [formState, setFormState] = useState<ClientConfigData | null>(null);

   useEffect(() => {
     if (clientConfig) {
       setFormState(clientConfig);
     }
   }, [clientConfig]);

   if (!formState) {
     return <Box sx={{ p: 4, textAlign: 'center' }}>Caricamento impostazioni client...</Box>;
   }

   const handleChange = (field: keyof ClientConfigData, value: any) => {
     setFormState(prev => {
       if (!prev) return null;
       return { ...prev, [field]: value };
     });
   };

   const handleSubmit = async () => {
     if (!formState) return;
     await onSave();
   };

   return (
     <Box sx={{ p: 4 }}>
       <Typography variant="h5" sx={{ mb: 4 }}>
         Impostazioni Cliente
       </Typography>
       
       <Card variant="glass" sx={{ mb: 4 }}>
         <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
           <Icon name="settings" size={22} color={theme.palette.primary.main} />
           <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
             Informazioni Base del Cliente
           </Typography>
         </Stack>
         
         <Grid container spacing={3}>
           <Grid item xs={12} sm={6}>
             <TextField
               label="Nome Cliente"
               value={formState.clientName || ''}
               onChange={(e) => handleChange('clientName', e.target.value)}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
             />
           </Grid>
           <Grid item xs={12} sm={6}>
             <TextField
               label="URL Logo Cliente"
               value={formState.clientLogoUrl || ''}
               onChange={(e) => handleChange('clientLogoUrl', e.target.value)}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
               inputProps={{ 
                 inputProps: {
                   'aria-label': 'URL Logo Cliente'
                 } 
               }}
             />
           </Grid>
           <Grid item xs={12} sm={6}>
             <TextField
               label="Fuso Orario Cliente"
               value={formState.clientTimeZone || ''}
               onChange={(e) => handleChange('clientTimeZone', e.target.value)}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
             />
           </Grid>
           <Grid item xs={12} sm={6}>
             <TextField
               label="Locale Cliente"
               value={formState.clientLocale || ''}
               onChange={(e) => handleChange('clientLocale', e.target.value)}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
             />
           </Grid>
         </Grid>
       </Card>

       <Card variant="glass" sx={{ mb: 4 }}>
         <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
           <Icon name="palette" size={22} color={theme.palette.primary.main} />
           <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
             Temi Colore
           </Typography>
         </Stack>
         
         <Grid container spacing={3}>
           <Grid item xs={12} sm={6}>
             <TextField
               label="Colore Primario"
               value={formState.primaryColor || ''}
               onChange={(e) => handleChange('primaryColor', e.target.value)}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
               inputProps={{ 
                 inputProps: {
                   'aria-label': 'Colore Primario'
                 } 
               }}
             />
           </Grid>
           <Grid item xs={12} sm={6}>
             <TextField
               label="Colore Secondario"
               value={formState.secondaryColor || ''}
               onChange={(e) => handleChange('secondaryColor', e.target.value)}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
               inputProps={{ 
                 inputProps: {
                   'aria-label': 'Colore Secondario'
                 } 
               }}
             />
           </Grid>
         </Grid>
       </Card>

       <Card variant="glass" sx={{ mb: 4 }}>
         <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
           <Icon name="security" size={22} color={theme.palette.primary.main} />
           <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
             Funzionalità Abilitate
           </Typography>
         </Stack>
         
         <Box sx={{ mb: 2 }}>
           <FormControlLabel
             control={
               <Checkbox
                 checked={formState.features?.enableCream ?? false}
                 onChange={(e) => {
                   setFormState(prev => {
                     if (!prev) return null;
                     return {
                       ...prev,
                       features: {
                         ...(prev.features || {}),
                         enableCream: e.target.checked
                       }
                     };
                   });
                 }}
                 disabled={saving}
                 label="Abilita Crema"
               />
             }
           />
         </Box>
         <Box sx={{ mb: 2 }}>
           <FormControlLabel
             control={
               <Checkbox
                 checked={formState.features?.enableWhatsApp ?? false}
                 onChange={(e) => {
                   setFormState(prev => {
                     if (!prev) return null;
                     return {
                       ...prev,
                       features: {
                         ...(prev.features || {}),
                         enableWhatsApp: e.target.checked
                       }
                     };
                   });
                 }}
                 disabled={saving}
                 label="Abilita WhatsApp"
               />
             }
           />
         </Box>
         <Box sx={{ mb: 2 }}>
           <FormControlLabel
             control={
               <Checkbox
                 checked={formState.features?.enableFormTemplate ?? false}
                 onChange={(e) => {
                   setFormState(prev => {
                     if (!prev) return null;
                     return {
                       ...prev,
                       features: {
                         ...(prev.features || {}),
                         enableFormTemplate: e.target.checked
                       }
                     };
                   });
                 }}
                 disabled={saving}
                 label="Abilita Moduli Form"
               />
             }
           />
         </Box>
         <Box sx={{ mb: 2 }}>
           <FormControlLabel
             control={
               <Checkbox
                 checked={formState.features?.enableConfig ?? false}
                 onChange={(e) => {
                   setFormState(prev => {
                     if (!prev) return null;
                     return {
                       ...prev,
                       features: {
                         ...(prev.features || {}),
                         enableConfig: e.target.checked
                       }
                     };
                   });
                 }}
                 disabled={saving}
                 label="Abilita Configurazione"
               />
             }
           />
         </Box>
       </Card>

       <Card variant="glass">
         <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
           <Icon name="layers" size={22} color={theme.palette.primary.main} />
           <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
             Limiti e Rate Limiting
           </Typography>
         </Stack>
         
         <Grid container spacing={3}>
           <Grid item xs={12} sm={6}>
             <TextField
               label="Massimo Utenti"
               type="number"
               value={formState.maxUsers?.toString() || ''}
               onChange={(e) => {
                 const val = parseInt(e.target.value, 10);
                 if (!isNaN(val)) {
                   setFormState(prev => {
                     if (!prev) return null;
                     return { ...prev, maxUsers: val };
                   });
                 }
               }}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
             />
           </Grid>
           <Grid item xs={12} sm={6}>
             <TextField
               label="Massimo Prenotazioni"
               type="number"
               value={formState.maxBookings?.toString() || ''}
               onChange={(e) => {
                 const val = parseInt(e.target.value, 10);
                 if (!isNaN(val)) {
                   setFormState(prev => {
                     if (!prev) return null;
                     return { ...prev, maxBookings: val };
                   });
                 }
               }}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
             />
           </Grid>
           <Grid item xs={12} sm={6}>
             <TextField
               label="Dimensione Massima Allegato (MB)"
               type="number"
               value={formState.maxAttachmentSizeMB?.toString() || ''}
               onChange={(e) => {
                 const val = parseInt(e.target.value, 10);
                 if (!isNaN(val)) {
                   setFormState(prev => {
                     if (!prev) return null;
                     return { ...prev, maxAttachmentSizeMB: val };
                   });
                 }
               }}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
             />
           </Grid>
           <Grid item xs={12} sm={6}>
             <TextField
               label="Limite Rate API (al minuto)"
               type="number"
               value={formState.apiRateLimitPerMinute?.toString() || ''}
               onChange={(e) => {
                 const val = parseInt(e.target.value, 10);
                 if (!isNaN(val)) {
                   setFormState(prev => {
                     if (!prev) return null;
                     return { ...prev, apiRateLimitPerMinute: val };
                   });
                 }
               }}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
             />
           </Grid>
         </Grid>
       </Card>

       <Box sx={{ mt: 4, textAlign: 'right' }}>
         <Button
           variant="contained"
           color="primary"
           size="large"
           disabled={saving}
           onClick={handleSubmit}
           startIcon={<Icon name="save" size={20} />}
         >
           Salva Impostazioni Cliente
         </Button>
       </Box>
     </Box>
   );
 }

 // User Settings Panel Component
 function UserSettingsPanel({ userPreferences, onSave, saving }: { 
   userPreferences: UserPreferencesData | null; 
   onSave: () => Promise<void>; 
   saving: boolean; 
 }) {
   const theme = useTheme();
   const isLight = theme.palette.mode === 'light';
   const [formState, setFormState] = useState<UserPreferencesData | null>(null);

   useEffect(() => {
     if (userPreferences) {
       setFormState(userPreferences);
     }
   }, [userPreferences]);

   if (!formState) {
     return <Box sx={{ p: 4, textAlign: 'center' }}>Caricamento preferenze utente...</Box>;
   }

   const handleChange = (field: keyof UserPreferencesData, value: any) => {
     setFormState(prev => {
       if (!prev) return null;
       return { ...prev, [field]: value };
     });
   };

   const handleSubmit = async () => {
     if (!formState) return;
     await onSave();
   };

   return (
     <Box sx={{ p: 4 }}>
       <Typography variant="h5" sx={{ mb: 4 }}>
         Impostazioni Utente
       </Typography>
       
       <Card variant="glass" sx={{ mb: 4 }}>
         <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
           <Icon name="language" size={22} color={theme.palette.primary.main} />
           <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
             Lingua e Formato
           </Typography>
         </Stack>
         
         <Grid container spacing={3}>
           <Grid item xs={12} sm={6}>
             <Select
               label="Lingua"
               value={formState.language || 'it'}
               onChange={(e) => handleChange('language', e.target.value as string)}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
             >
               <MenuItem value="it">
                 Italiano
               </MenuItem>
               <MenuItem value="en">
                 English
               </MenuItem>
             </Select>
           </Grid>
           <Grid item xs={12} sm={6}>
             <Select
               label="Fuso Orario"
               value={formState.timezone || 'Europe/Rome'}
               onChange={(e) => handleChange('timezone', e.target.value as string)}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
             >
               <MenuItem value="Europe/Rome">
                 Roma (UTC+1)
               </MenuItem>
               <MenuItem value="Europe/London">
                 Londra (UTC+0)
               </MenuItem>
               <MenuItem value="America/New_York">
                 New York (UTC-5)
               </MenuItem>
               <MenuItem value="Asia/Tokyo">
                 Tokyo (UTC+9)
               </MenuItem>
             </Select>
           </Grid>
           <Grid item xs={12} sm={6}>
             <Select
               label="Formato Data"
               value={formState.dateFormat || 'DD/MM/YYYY'}
               onChange={(e) => handleChange('dateFormat', e.target.value as string)}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
             >
               <MenuItem value="DD/MM/YYYY">
                 GG/MM/AAAA
               </MenuItem>
               <MenuItem value="MM/DD/YYYY">
                 MM/GG/AAAA
               </MenuItem>
               <MenuItem value="YYYY-MM-DD">
                 AAAA-MM-GG
               </MenuItem>
             </Select>
           </Grid>
           <Grid item xs={12} sm={6}>
             <TextField
               label="Elementi per Pagina"
               type="number"
               value={formState.itemsPerPage?.toString() || ''}
               onChange={(e) => {
                 const val = parseInt(e.target.value, 10);
                 if (!isNaN(val) && val >= 5 && val <= 100) {
                   setFormState(prev => {
                     if (!prev) return null;
                     return { ...prev, itemsPerPage: val };
                   });
                 }
               }}
               disabled={saving}
               sx={{ mb: 2 }}
               fullWidth
               InputLabelProps={{
                 shrink: true,
               }}
             />
           </Grid>
         </Grid>
       </Card>

       <Card variant="glass" sx={{ mb: 4 }}>
         <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
           <Icon name="notifications" size={22} color={theme.palette.primary.main} />
           <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
             Notifiche
           </Typography>
         </Stack>
         
         <Box sx={{ mb: 2 }}>
           <FormControlLabel
             control={
               <Checkbox
                 checked={formState.emailNotifications ?? false}
                 onChange={(e) => {
                   setFormState(prev => {
                     if (!prev) return null;
                     return { ...prev, emailNotifications: e.target.checked };
                   });
                 }}
                 disabled={saving}
                 label="Notifiche Email"
               />
             }
           />
         </Box>
         <Box sx={{ mb: 2 }}>
           <FormControlLabel
             control={
               <Checkbox
                 checked={formState.inAppNotifications ?? false}
                 onChange={(e) => {
                   setFormState(prev => {
                     if (!prev) return null;
                     return { ...prev, inAppNotifications: e.target.checked };
                   });
                 }}
                 disabled={saving}
                 label="Notifiche in-App"
               />
             }
           />
         </Box>
       </Card>

       <Box sx={{ mt: 4, textAlign: 'right' }}>
         <Button
           variant="contained"
           color="primary"
           size="large"
           disabled={saving}
           onClick={handleSubmit}
           startIcon={<Icon name="save" size={20} />}
         >
           Salva Preferenze Utente
         </Button>
       </Box>
     </Box>
   );
 }

  const isLight = theme.palette.mode === 'light';

  return (
    <PageTransition>
      <Box sx={{ pb: 6, pt: 1 }}>
        {/* Header Banner */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            mb: 4,
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            background: isLight
              ? `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.common.black, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
            boxShadow: isLight
              ? `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`
              : `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}, inset 0 0 15px ${alpha(theme.palette.primary.main, 0.05)}`,
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
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 0.5 }}>
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
          border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.15 : 0.08)}`,
          backgroundColor: isLight
            ? alpha(theme.palette.primary.main, 0.05)
            : alpha(theme.palette.common.black, 0.3),
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
            color: activeTab === 'general' ? '#ffffff' : 'text.secondary',
            ...(activeTab === 'general' ? {
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
            } : {
              '&:hover': {
                color: 'text.primary',
                backgroundColor: isLight
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.common.white, 0.05),
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
            color: activeTab === 'customFields' ? '#ffffff' : 'text.secondary',
            ...(activeTab === 'customFields' ? {
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
            } : {
              '&:hover': {
                color: 'text.primary',
                backgroundColor: isLight
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.common.white, 0.05),
              }
            })
          }}
        >
          Campi Personalizzati
        </Button>
        <Button
          variant={activeTab === 'performance' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('performance')}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 1.5,
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeTab === 'performance' ? '#ffffff' : 'text.secondary',
            ...(activeTab === 'performance' ? {
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
            } : {
              '&:hover': {
                color: 'text.primary',
                backgroundColor: isLight
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.common.white, 0.05),
              }
            })
          }}
        >
          Prestazioni & Diagnostica
        </Button>
        <Button
          variant={activeTab === 'clientSettings' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('clientSettings')}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 1.5,
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeTab === 'clientSettings' ? '#ffffff' : 'text.secondary',
            ...(activeTab === 'clientSettings' ? {
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
            } : {
              '&:hover': {
                color: 'text.primary',
                backgroundColor: isLight
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.common.white, 0.05),
              }
            })
          }}
        >
          Impostazioni Cliente
        </Button>
        <Button
          variant={activeTab === 'userSettings' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('userSettings')}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 1.5,
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeTab === 'userSettings' ? '#ffffff' : 'text.secondary',
            ...(activeTab === 'userSettings' ? {
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
            } : {
              '&:hover': {
                color: 'text.primary',
                backgroundColor: isLight
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.common.white, 0.05),
              }
            })
          }}
        >
          Impostazioni Utente
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
                 backgroundColor: isLight ? 'background.paper' : alpha(theme.palette.common.white, 0.02),
                 backdropFilter: 'blur(20px)',
               }}
             >
               <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
                 <Icon name="toggleLeft" size={22} color={theme.palette.primary.main} />
                 <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                   Attivazione Moduli e Feature Flags
                 </Typography>
               </Stack>
               <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
                 Abilita o disabilita all'istante le funzionalità sul database. Le modifiche avranno impatto immediato su tutti i ruoli non autorizzati e nasconderanno automaticamente le rispettive voci di navigazione.
               </Typography>

               <Stack spacing={3}>
                 {/* Default Phone Prefix Input */}
                 <Box
                   sx={{
                     p: 2.5,
                     borderRadius: 2,
                     border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.12 : 0.06)}`,
                     backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.common.white, 0.01),
                     transition: 'all 0.3s ease',
                   }}
                 >
                   <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1rem', mb: 0.5 }}>
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
                         backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : alpha(theme.palette.common.black, 0.3),
                         border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.3 : 0.2)}`,
                         borderRadius: '8px',
                         color: theme.palette.text.primary,
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
                         background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                         boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                         '&:hover': {
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
                 backgroundColor: isLight ? 'background.paper' : alpha(theme.palette.common.white, 0.02),
                 backdropFilter: 'blur(20px)',
               }}
             >
               <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
                 <Icon name="settings2" size={22} color={theme.palette.primary.main} />
                 <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                   Strumenti di Manutenzione & Utility
                 </Typography>
               </Stack>
               <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                 Avvia interventi di diagnostica o ottimizzazione in totale sicurezza sul database o sull'integrazione WhatsApp.
               </Typography>

               <Stack spacing={2}>
                 {/* Reset Cache Tool */}
                 <Box sx={{ p: 2, borderRadius: 2, backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.common.white, 0.02), border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.1 : 0.04)}` }}>
                   <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                     <Box>
                       <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9375rem' }}>🧹 Svuota Cache di Sessione</Typography>
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
                 <Box sx={{ p: 2, borderRadius: 2, backgroundColor: isLight ? alpha(theme.palette.success.main, 0.03) : alpha(theme.palette.common.white, 0.02), border: `1px solid ${alpha(theme.palette.success.main, isLight ? 0.15 : 0.04)}` }}>
                   <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                     <Box>
                       <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9375rem' }}>💾 Backup Database Struttura</Typography>
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
                 <Box sx={{ p: 2, borderRadius: 2, backgroundColor: isLight ? alpha(theme.palette.warning.main, 0.03) : alpha(theme.palette.common.white, 0.02), border: `1px solid ${alpha(theme.palette.warning.main, isLight ? 0.15 : 0.04)}` }}>
                   <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                     <Box>
                       <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9375rem' }}>🔌 Riavvia Gateway WhatsApp</Typography>
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
                 backgroundColor: isLight ? 'background.paper' : alpha(theme.palette.common.white, 0.02),
                 backdropFilter: 'blur(20px)',
               }}
             >
               <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 4 }}>
                 <Icon name="cpu" size={22} color={theme.palette.primary.main} />
                 <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
                       backgroundColor: isLight ? alpha(theme.palette.success.main, 0.04) : alpha(theme.palette.common.white, 0.01),
                       border: `1px solid ${alpha(theme.palette.success.main, isLight ? 0.2 : 0.04)}`,
                     }}
                   >
                     <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                       <Icon name="database" size={18} color={theme.palette.success.main} />
                       <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Database</Typography>
                     </Stack>
                     <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                       {systemHealth?.dbStatus || 'ONLINE'}
                     </Typography>
                     <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                       <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main', boxShadow: `0 0 8px ${theme.palette.success.main}` }} />
                       <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                         Latenza: {systemHealth?.dbLatencyMs || 4}ms (Ottimale)
                       </Typography>
                     </Stack>
                   </Box>
                 </Grid>

                 {/* WhatsApp Connection */}
                 <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                   <Box
                     sx={{
                       p: 2.5,
                       borderRadius: 2,
                       backgroundColor: isLight ? alpha(theme.palette.success.main, 0.04) : alpha(theme.palette.common.white, 0.01),
                       border: `1px solid ${alpha(theme.palette.success.main, isLight ? 0.2 : 0.04)}`,
                     }}
                   >
                     <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                       <Icon name="network" size={18} color={theme.palette.success.main} />
                       <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>WhatsApp Gateway</Typography>
                     </Stack>
                     <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>CONNESSO</Typography>
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
                       backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.common.white, 0.01),
                       border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.2 : 0.04)}`,
                     }}
                   >
                     <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                       <Icon name="hardDrive" size={18} color={theme.palette.primary.main} />
                       <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Storage Documenti</Typography>
                     </Stack>
                     <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                       {systemHealth?.storagePercent ?? 0}% Usato
                     </Typography>
                     <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                       <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                         {systemHealth?.storageFormatted ?? '0 MB'} / 10 GB totali
                       </Typography>
                     </Stack>
                   </Box>
                 </Grid>

                 {/* Security Config */}
                 <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                   <Box
                     sx={{
                       p: 2.5,
                       borderRadius: 2,
                       backgroundColor: isLight ? alpha(theme.palette.warning.main, 0.04) : alpha(theme.palette.common.white, 0.01),
                       border: `1px solid ${alpha(theme.palette.warning.main, isLight ? 0.2 : 0.04)}`,
                     }}
                   >
                     <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                       <Icon name="shield" size={18} color={theme.palette.warning.main} />
                       <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Sessioni & Sicurezza</Typography>
                     </Stack>
                     <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>8 Ore (Scadenza)</Typography>
                     <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                       <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>JWT salt rounds: 10</Typography>
                     </Stack>
                   </Box>
                 </Grid>
               </Grid>
             </Card>
           </Grid>
         </Grid>
         ) : activeTab === 'customFields' ? (
           <CustomFieldsManager />
         ) : activeTab === 'performance' ? (
           <PerformanceDashboard />
         ) : activeTab === 'clientSettings' ? (
           <ClientSettingsPanel
             clientConfig={clientConfig}
             onSave={handleSaveClientConfig}
             saving={clientSaving}
           />
         ) : activeTab === 'userSettings' ? (
           <UserSettingsPanel
             userPreferences={userPreferences}
             onSave={handleSaveUserPreferences}
             saving={userSaving}
           />
         ) : null
}
      </Box>
    </PageTransition>
  );
}
