'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme, alpha } from '@mui/material/styles';
import Icon from '@/common/components/ui/Icon';
import Button from '@/common/components/ui/Button';
import { ConfirmDialog } from '@/common/components/ui/ConfirmDialog';
import { useBirthdays } from '../hooks/useBirthdays';
import type { BirthdayCustomer } from '../model/whatsapp.types';

export default function TodayBirthdaysWidget() {
  const theme = useTheme();
  const { birthdays, unsentCount, templateConfigured, isLoading, isSending, sendGreeting, sendAll } = useBirthdays();
  const [resendTarget, setResendTarget] = useState<BirthdayCustomer | null>(null);

  if (isLoading) {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          backgroundColor: theme.palette.action.hover,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={20} color="primary" />
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          Controllo compleanni di oggi...
        </Typography>
      </Box>
    );
  }

  if (birthdays.length === 0) {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          backgroundColor: theme.palette.action.hover,
          border: 1,
          borderColor: theme.palette.divider,
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
              width: 38,
              height: 38,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          >
            <Icon name="gift" size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary' }}>
              Compleanni di Oggi
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              Nessun cliente compie gli anni oggi. Il controllo automatico verifica gli invii alle 10:00, 11:00 e 12:00.
            </Typography>
          </Box>
        </Box>
        {!templateConfigured && <TemplateMissingNotice />}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.25),
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
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              color: 'primary.main',
            }}
          >
            <Icon name="gift" size={22} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                Compleanni di Oggi
              </Typography>
              <Chip
                label={`${birthdays.length} ${birthdays.length === 1 ? 'cliente' : 'clienti'}`}
                size="small"
                color="primary"
                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              {unsentCount > 0
                ? `${unsentCount} da contattare oggi via WhatsApp`
                : 'Tutti gli auguri di oggi sono stati inviati'}
            </Typography>
          </Box>
        </Box>

        {unsentCount > 1 && (
          <Button
            variant="primary"
            onClick={sendAll}
            disabled={isSending || !templateConfigured}
            icon={<Icon name="send" size={16} />}
          >
            {isSending ? 'Invio in corso...' : 'Invia a tutti i non contattati'}
          </Button>
        )}
      </Box>

      {!templateConfigured && <TemplateMissingNotice />}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 0.5 }}>
        {birthdays.map((c: BirthdayCustomer) => (
          <Box
            key={c.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: theme.palette.action.hover,
              border: 1,
              borderColor: theme.palette.divider,
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 200 }}>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                  {c.firstName} {c.lastName}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  {c.phone || 'Nessun telefono registrato'}
                  {c.birthDate ? ` • Nato il ${new Date(c.birthDate).toLocaleDateString('it-IT')}` : ''}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {c.alreadySentToday ? (
                <Chip
                  label="Auguri inviati oggi"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 26, fontSize: '0.75rem' }}
                />
              ) : (
                <Chip
                  label="In attesa"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ height: 26, fontSize: '0.75rem' }}
                />
              )}

              <Button
                variant={c.alreadySentToday ? 'secondary' : 'primary'}
                onClick={() => (c.alreadySentToday ? setResendTarget(c) : sendGreeting(c))}
                disabled={isSending || !c.phone || !templateConfigured}
                icon={<Icon name="messageCircle" size={14} />}
                sx={{ minHeight: 36, py: 0.5, px: 1.5, fontSize: '0.8125rem' }}
              >
                {c.alreadySentToday ? 'Rinvia WhatsApp' : 'Invia WhatsApp'}
              </Button>
            </Box>
          </Box>
        ))}
      </Box>

      <ConfirmDialog
        open={resendTarget !== null}
        onClose={() => setResendTarget(null)}
        onConfirm={() => {
          if (resendTarget) void sendGreeting(resendTarget);
          setResendTarget(null);
        }}
        title="Rinviare gli auguri?"
        message={resendTarget
          ? `${resendTarget.firstName} ${resendTarget.lastName} ha già ricevuto gli auguri oggi: riceverà un secondo messaggio.`
          : ''}
        confirmText="Rinvia"
        severity="primary"
      />
    </Box>
  );
}

function TemplateMissingNotice() {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        p: 1.5,
        borderRadius: 2,
        border: 1,
        borderColor: 'warning.main',
        bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
        color: 'warning.main',
      }}
    >
      <Icon name="alertTriangle" size={18} />
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.primary' }}>
        Gli auguri non partono finché non esiste un template attivo con categoria <strong>Compleanno</strong>.
        Crealo qui sotto con il testo che preferisci: puoi usare <strong>{'{{nome}}'}</strong> e <strong>{'{{cognome}}'}</strong>.
      </Typography>
    </Box>
  );
}
