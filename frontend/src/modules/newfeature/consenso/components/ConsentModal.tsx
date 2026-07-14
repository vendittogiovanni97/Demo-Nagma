"use client";

import React, { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import Button from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';
import SmartModal from '@/common/components/common/SmartModal';
import Icon from '@/common/components/ui/Icon';

import type { Booking } from '@/modules/booking/model/booking.types';

interface ConsentModalProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export default function ConsentModal({ open, onClose, booking }: ConsentModalProps) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const consent = (booking.formData as any)?.consent;
  const isSigned = !!consent?.signed;
  const hasAlerts = !!consent?.hasMedicalAlerts;
  const alertsDetails = consent?.medicalAlertsDetails || '';

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/consenso/${booking.id}`
    : `/consenso/${booking.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Impossibile copiare il link negli appunti.");
    }
  };

  const handleOpenPublicForm = () => {
    window.open(publicUrl, '_blank');
  };

  const handleDownloadPdf = () => {
    if (consent?.attachmentId) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      window.open(`${apiBase}/attachments/${consent.attachmentId}/download`, '_blank');
    }
  };

  if (!booking.customer) return null;
  const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;

  return (
    <SmartModal
      isOpen={open}
      onClose={onClose}
      title="Consenso Informato"
      maxWidth="xs"
      showFooter={false}
      headerAction={<Icon name="fileText" size={20} color={theme.palette.custom.purple} />}
    >
      <Stack spacing={2.5}>

        {/* CLIENT QUICK INFO */}
        <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: alpha(theme.palette.common.white, 0.02), border: `1px solid ${alpha(theme.palette.common.white, 0.05)}` }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
            CLIENTE ASSOCIATO
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'common.white', mt: 0.5 }}>
            {customerName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
            Identificativo Prenotazione: #{booking.id}
          </Typography>
        </Box>

        {/* STATUS BLOCK */}
        {isSigned ? (
          <Stack spacing={2}>
            <Card size="sm" variant="minimal" sx={{ border: `1px solid ${theme.palette.custom.emerald}`, backgroundColor: alpha(theme.palette.custom.emerald, 0.04), borderRadius: '10px' }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                <Icon name="checkCircle" size={22} color={theme.palette.custom.emerald} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'custom.emerald' }}>
                    Documento Sottoscritto!
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                    Firmato digitalmente il {new Date(consent.signedAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.2, display: 'block' }}>
                    Doc. d'Identità: {consent.documentId}
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {hasAlerts && (
              <Card size="sm" variant="minimal" sx={{ border: `1.5px solid ${theme.palette.error.main}`, backgroundColor: alpha(theme.palette.error.main, 0.05), borderRadius: '10px', boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.15)}` }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                  <Icon name="alertTriangle" size={24} color={theme.palette.error.main} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'error.main', letterSpacing: -0.2 }}>
                      🚨 ATTENZIONE: ALLERTE MEDICHE
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.8, fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.4 }}>
                      {alertsDetails}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            )}

            <Button
              variant="ghost"
              fullWidth
              onClick={handleDownloadPdf}
              icon={<Icon name="userCheck" size={16} />}
              sx={{
                py: 1.2,
                borderRadius: '8px',
                border: `1px solid ${alpha(theme.palette.custom.purple, 0.3)}`,
                fontWeight: 600,
                fontSize: '0.85rem',
                '&:hover': {
                  borderColor: 'custom.purple',
                  backgroundColor: alpha(theme.palette.custom.purple, 0.05),
                },
              }}
            >
              Visualizza / Scarica PDF Firmato
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Card size="sm" variant="minimal" sx={{ border: 1, borderColor: 'divider', backgroundColor: alpha(theme.palette.common.white, 0.01), borderRadius: '10px' }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Icon name="alertTriangle" size={20} color={theme.palette.text.secondary} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    Consenso non ancora firmato
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                    Il cliente deve compilare e firmare il questionario prima di avviare il tatuaggio.
                  </Typography>
                </Box>
              </Stack>
            </Card>

            <Divider />

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="ghost"
                fullWidth
                onClick={handleCopyLink}
                icon={<Icon name="copy" size={14} />}
                sx={{
                  py: 1.2,
                  borderRadius: '8px',
                  border: '1px solid var(--color-surface-border)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  '&:hover': {
                    borderColor: 'common.white',
                    backgroundColor: alpha(theme.palette.common.white, 0.02),
                  },
                }}
              >
                {copied ? "Copiato!" : "Copia Link"}
              </Button>

              <Button
                variant="primary"
                fullWidth
                onClick={handleOpenPublicForm}
                icon={<Icon name="externalLink" size={14} />}
                sx={{
                  py: 1.2,
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                Firma in Studio
              </Button>
            </Stack>
          </Stack>
        )}

        <Box sx={{ textAlign: 'center' }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            sx={{
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: 0.5,
            }}
          >
            Chiudi
          </Button>
        </Box>
      </Stack>
    </SmartModal>
  );
}