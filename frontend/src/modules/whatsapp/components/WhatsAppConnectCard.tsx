'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme, alpha } from '@mui/material/styles';
import Icon from '@/common/components/ui/Icon';
import Button from '@/common/components/ui/Button';
import { useWhatsAppConnection } from '../hooks/useWhatsAppConnection';

export default function WhatsAppConnectCard() {
  const theme = useTheme();
  const { session, isLoading, isActionLoading, connect, disconnect } = useWhatsAppConnection();

  const isConnected = session?.status === 'CONNECTED';
  const isConnecting = session?.status === 'CONNECTING';

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        backgroundColor: isConnected
          ? alpha(theme.palette.success.main, 0.04)
          : theme.palette.action.hover,
        border: 1,
        borderColor: isConnected
          ? alpha(theme.palette.success.main, 0.25)
          : theme.palette.divider,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isConnected
                ? alpha(theme.palette.success.main, 0.15)
                : alpha(theme.palette.primary.main, 0.1),
              color: isConnected ? 'success.main' : 'primary.main',
            }}
          >
            <Icon name="messageSquare" size={24} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                Connessione WhatsApp Studio
              </Typography>
              {isLoading ? (
                <CircularProgress size={16} />
              ) : isConnected ? (
                <Chip
                  label="Connesso"
                  size="small"
                  color="success"
                  sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                />
              ) : isConnecting ? (
                <Chip
                  label="In connessione..."
                  size="small"
                  color="warning"
                  sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                />
              ) : (
                <Chip
                  label="Non collegato"
                  size="small"
                  color="default"
                  sx={{ height: 22, fontSize: '0.75rem' }}
                />
              )}
            </Box>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 0.25 }}>
              {isConnected
                ? `Numero collegato: ${session?.phoneNumber ? `+${session.phoneNumber}` : 'Studio'}. Gli auguri di compleanno e i messaggi automatici partiranno da questo numero.`
                : 'Collega WhatsApp dello studio inquadrando il QR Code per abilitare gli invii automatici silenziosi a costo zero.'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isConnected ? (
            <Button
              variant="secondary"
              onClick={disconnect}
              disabled={isActionLoading}
              icon={<Icon name="logOut" size={16} />}
            >
              {isActionLoading ? 'Disconnessione...' : 'Disconnetti'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={connect}
              disabled={isActionLoading}
              icon={<Icon name="qrCode" size={16} />}
            >
              {isActionLoading
                ? 'Avvio in corso...'
                : session?.qrCodeDataUrl
                ? 'Rigenera QR Code'
                : 'Collega WhatsApp'}
            </Button>
          )}
        </Box>
      </Box>

      {!isConnected && session?.qrCodeDataUrl && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 3,
            p: 2.5,
            borderRadius: 2,
            backgroundColor: theme.palette.action.hover,
            border: 1,
            borderColor: alpha(theme.palette.primary.main, 0.2),
            mt: 0.5,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              backgroundColor: theme.palette.common.white,
              borderRadius: 2,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadows[4],
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={session.qrCodeDataUrl}
              alt="Inquadra il QR Code con WhatsApp"
              style={{ width: 180, height: 180, display: 'block' }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary', mb: 1 }}>
              Come collegare WhatsApp dello Studio:
            </Typography>
            <Box component="ol" sx={{ pl: 2.5, m: 0, color: 'text.secondary', fontSize: '0.8125rem', '& li': { mb: 0.5 } }}>
              <li>Apri WhatsApp sul telefono dello studio.</li>
              <li>Tocca <strong>Impostazioni</strong> (o i tre puntini) &gt; <strong>Dispositivi collegati</strong>.</li>
              <li>Tocca <strong>Collega un dispositivo</strong> e inquadra questo codice QR.</li>
              <li>Una volta inquadrato, lo stato diventerà verde automaticamente.</li>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
