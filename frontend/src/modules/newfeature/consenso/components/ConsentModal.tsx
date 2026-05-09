"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Typography,
  IconButton,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { X, Copy, ExternalLink, CheckCircle, AlertTriangle, FileText, UserCheck } from 'lucide-react';

import type { Booking } from '@/modules/booking/model/booking.types';

interface ConsentModalProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export default function ConsentModal({ open, onClose, booking }: ConsentModalProps) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  // Read consent data from the JSON column formData
  const consent = (booking.formData as any)?.consent;
  const isSigned = !!consent?.signed;
  const hasAlerts = !!consent?.hasMedicalAlerts;
  const alertsDetails = consent?.medicalAlertsDetails || '';

  // Construct the public signing URL
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '16px',
          backgroundImage: 'none',
          backgroundColor: '#0F172A', // Premium Dark Slate
          border: '1px solid var(--color-surface-border)',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.7)',
        },
      }}
    >
      <DialogTitle sx={{ p: 2.5, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <FileText size={20} className="text-[#9155FD]" />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.3, color: 'white' }}>
            Consenso Informato
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'white' } }}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 1 }}>
        <Stack spacing={2.5}>
          
          {/* CLIENT QUICK INFO */}
          <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
              CLIENTE ASSOCIATO
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', mt: 0.5 }}>
              {customerName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
              Identificativo Prenotazione: #{booking.id}
            </Typography>
          </Box>

          {/* STATUS BLOCK */}
          {isSigned ? (
            /* CASE A: SIGNED CONSENT */
            <Stack spacing={2}>
              <Card sx={{ border: '1px solid #10B981', backgroundColor: 'rgba(16, 185, 129, 0.04)', borderRadius: '10px' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                    <CheckCircle size={22} className="text-[#10B981] shrink-0" />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#10B981' }}>
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
                </CardContent>
              </Card>

              {/* MEDICAL ALERTS IF PRESENT */}
              {hasAlerts && (
                <Card sx={{ border: '1.5px solid #EF4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '10px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                      <AlertTriangle size={24} className="text-[#EF4444] shrink-0 animate-pulse" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#EF4444', letterSpacing: -0.2 }}>
                          🚨 ATTENZIONE: ALLERTE MEDICHE
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white', mt: 0.8, fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.4 }}>
                          {alertsDetails}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleDownloadPdf}
                startIcon={<UserCheck size={16} />}
                sx={{
                  py: 1.2,
                  borderRadius: '8px',
                  borderColor: 'rgba(145, 85, 253, 0.3)',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  '&:hover': {
                    borderColor: '#9155FD',
                    backgroundColor: 'rgba(145, 85, 253, 0.05)',
                  },
                }}
              >
                Visualizza / Scarica PDF Firmato
              </Button>
            </Stack>
          ) : (
            /* CASE B: PENDING SIGNATURE */
            <Stack spacing={2}>
              <Card sx={{ border: '1px solid #E2E8F0', borderColor: 'var(--color-surface-border)', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '10px' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <AlertTriangle size={20} className="text-[#E2E8F0] opacity-60" />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Consenso non ancora firmato
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                        Il cliente deve compilare e firmare il questionario prima di avviare il tatuaggio.
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Divider />

              <Stack direction="row" spacing={1.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCopyLink}
                  startIcon={<Copy size={14} />}
                  sx={{
                    py: 1.2,
                    borderRadius: '8px',
                    borderColor: 'var(--color-surface-border)',
                    color: 'text.secondary',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                    },
                  }}
                >
                  {copied ? "Copiato!" : "Copia Link"}
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleOpenPublicForm}
                  startIcon={<ExternalLink size={14} />}
                  sx={{
                    py: 1.2,
                    borderRadius: '8px',
                    backgroundColor: '#9155FD',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    boxShadow: '0 4px 10px rgba(145, 85, 253, 0.2)',
                    '&:hover': {
                      backgroundColor: '#8040E6',
                      boxShadow: '0 6px 14px rgba(145, 85, 253, 0.3)',
                    },
                  }}
                >
                  Firma in Studio
                </Button>
              </Stack>
            </Stack>
          )}

        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1, justifyContent: 'center' }}>
        <Button
          size="small"
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontWeight: 700,
            fontSize: '0.7rem',
            letterSpacing: 0.5,
            '&:hover': { color: 'white' },
          }}
        >
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
