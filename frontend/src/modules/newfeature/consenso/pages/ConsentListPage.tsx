"use client";

import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import { FileText, AlertTriangle, CheckCircle, Download, Search, User, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useConsentConfig } from '../hooks/useConsentConfig';
import { useConsentList } from '../hooks/useConsentList';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import PageHeader from '@/components/common/PageHeader';
import { API_BASE_URL } from '@/shared/api/endpoints';
import { ConsentRecord } from '../model/consent-list.types';

export default function ConsentListPage() {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const { showConsensi, loading: configLoading } = useConsentConfig();
  const { data: consents, isLoading, error } = useConsentList();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return consents;
    const q = debouncedSearch.toLowerCase();
    return consents.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        (c.artistName ?? '').toLowerCase().includes(q)
    );
  }, [consents, debouncedSearch]);

  const selected = useMemo(
    () => consents.find((c) => c.bookingId === selectedId) ?? null,
    [consents, selectedId]
  );

  const getPdfUrl = (record: ConsentRecord) => {
    if (!record.attachment) return null;
    return `${API_BASE_URL}${record.attachment.filePath}`;
  };

  if (configLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={50} sx={{ color: '#00bfff' }} />
      </Box>
    );
  }

  if (!isAdmin || !showConsensi) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <AlertTriangle size={64} color={theme.palette.error.main} style={{ marginBottom: 16 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#ffffff', fontFamily: 'Outfit' }}>
          Accesso Non Autorizzato
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, textAlign: 'center', maxWidth: 450 }}>
          Questa sezione è riservata agli amministratori e richiede l'attivazione del modulo consensi.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '90vh', backgroundColor: '#060b13' }}>
      <PageHeader
        title="Archivio Consensi Firmati"
        subtitle="Registro digitale di tutti i consensi informativi raccolti e firmati dai clienti"
      />

      <Grid container spacing={4} sx={{ mt: 1 }}>
        {/* LEFT: CONSENT LIST */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{
            background: 'rgba(10, 26, 38, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 191, 255, 0.12)',
            borderRadius: 4,
            height: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Search box */}
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 191, 255, 0.08)' }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 1.5,
                py: 1,
                borderRadius: 3,
                bgcolor: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(0, 191, 255, 0.08)',
              }}>
                <Search size={15} style={{ color: 'rgba(0, 191, 255, 0.6)', flexShrink: 0 }} />
                <Box
                  component="input"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  placeholder="Cerca cliente o artista..."
                  sx={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontFamily: 'Outfit',
                    '&::placeholder': { color: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 1, display: 'block', textAlign: 'right' }}>
                {filtered.length} consenso{filtered.length !== 1 ? 'i' : ''} trovato{filtered.length !== 1 ? 'i' : ''}
              </Typography>
            </Box>

            {/* List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={30} sx={{ color: '#00bfff' }} />
                </Box>
              ) : error ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
                    Errore nel caricamento.
                  </Typography>
                </Box>
              ) : filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <FileText size={40} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 12 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                    Nessun consenso trovato.
                  </Typography>
                </Box>
              ) : (
                filtered.map((c) => {
                  const isSelected = c.bookingId === selectedId;
                  return (
                    <Card
                      key={c.bookingId}
                      onClick={() => setSelectedId(c.bookingId)}
                      sx={{
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(0, 191, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '1px solid #00bfff' : '1px solid rgba(0, 191, 255, 0.05)',
                        borderRadius: 3,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: isSelected ? 'rgba(0, 191, 255, 0.16)' : 'rgba(0, 191, 255, 0.05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 20px rgba(0, 191, 255, 0.08)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: '12px !important' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
                            {c.customerName}
                          </Typography>
                          {c.hasMedicalAlerts ? (
                            <Chip
                              label="Alert"
                              size="small"
                              sx={{ bgcolor: 'rgba(255,152,0,0.15)', color: '#ff9800', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
                            />
                          ) : (
                            <Chip
                              label="OK"
                              size="small"
                              sx={{ bgcolor: 'rgba(76,175,80,0.15)', color: '#4caf50', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
                            />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'rgba(255,255,255,0.45)', mb: 0.5 }}>
                          <User size={11} />
                          <Typography variant="caption">{c.artistName ?? 'N/D'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'rgba(255,255,255,0.45)' }}>
                          <Calendar size={11} />
                          <Typography variant="caption">
                            {format(new Date(c.date), 'dd/MM/yyyy HH:mm', { locale: it })}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </Box>
          </Card>
        </Grid>

        {/* RIGHT: DETAIL PANEL */}
        <Grid size={{ xs: 12, md: 8 }}>
          {selected ? (
            <Card sx={{
              background: 'rgba(10, 26, 38, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 191, 255, 0.12)',
              borderRadius: 4,
              p: 4,
            }}>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', fontFamily: 'Outfit', mb: 0.5 }}>
                    {selected.customerName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Appuntamento con <strong style={{ color: '#00bfff' }}>{selected.artistName ?? 'N/D'}</strong>
                    {' · '}
                    {format(new Date(selected.date), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
                  </Typography>
                </Box>

                {selected.attachment && (
                  <Button
                    variant="contained"
                    href={getPdfUrl(selected) ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<Download size={16} />}
                    sx={{
                      borderRadius: 3,
                      bgcolor: '#00bfff',
                      color: '#060b13',
                      fontWeight: 800,
                      textTransform: 'none',
                      px: 3,
                      boxShadow: '0 4px 14px rgba(0, 191, 255, 0.4)',
                      '&:hover': { bgcolor: '#009acd', boxShadow: '0 6px 20px rgba(0, 191, 255, 0.6)' },
                    }}
                  >
                    Scarica PDF
                  </Button>
                )}
              </Box>

              <Divider sx={{ borderColor: 'rgba(0, 191, 255, 0.08)', mb: 3 }} />

              {/* Status Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  {
                    label: 'Stato Firma',
                    value: 'Firmato',
                    icon: <CheckCircle size={18} color="#4caf50" />,
                    color: '#4caf50',
                    bg: 'rgba(76,175,80,0.08)',
                  },
                  {
                    label: 'Data Firma',
                    value: selected.signedAt ? format(new Date(selected.signedAt), "dd/MM/yyyy 'alle' HH:mm") : '—',
                    icon: <Calendar size={18} color="#00bfff" />,
                    color: '#00bfff',
                    bg: 'rgba(0,191,255,0.08)',
                  },
                  {
                    label: 'Telefono',
                    value: selected.phone || '—',
                    icon: <User size={18} color="#ce93d8" />,
                    color: '#ce93d8',
                    bg: 'rgba(206,147,216,0.08)',
                  },
                  {
                    label: 'Alert Medici',
                    value: selected.hasMedicalAlerts ? 'Presenti' : 'Nessuno',
                    icon: <Shield size={18} color={selected.hasMedicalAlerts ? '#ff9800' : '#4caf50'} />,
                    color: selected.hasMedicalAlerts ? '#ff9800' : '#4caf50',
                    bg: selected.hasMedicalAlerts ? 'rgba(255,152,0,0.08)' : 'rgba(76,175,80,0.08)',
                  },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 6, md: 3 }}>
                    <Box sx={{
                      bgcolor: item.bg,
                      border: `1px solid ${item.color}22`,
                      borderRadius: 3,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}>
                      {item.icon}
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: item.color, fontWeight: 800, fontFamily: 'Outfit' }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Medical Alerts detail */}
              {selected.hasMedicalAlerts && selected.medicalAlertsDetails && (
                <Box sx={{
                  bgcolor: 'rgba(255,152,0,0.06)',
                  border: '1px solid rgba(255,152,0,0.2)',
                  borderRadius: 3,
                  p: 2.5,
                  mt: 1,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AlertTriangle size={16} color="#ff9800" />
                    <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Dettaglio Alert Medici
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                    {selected.medicalAlertsDetails.split(' | ').map((alert, i) => (
                      <Box key={i} component="span" sx={{ display: 'block' }}>
                        • {alert}
                      </Box>
                    ))}
                  </Typography>
                </Box>
              )}

              {/* Attachment info */}
              {selected.attachment && (
                <Box sx={{
                  bgcolor: 'rgba(0, 191, 255, 0.04)',
                  border: '1px solid rgba(0, 191, 255, 0.1)',
                  borderRadius: 3,
                  p: 2,
                  mt: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FileText size={20} style={{ color: '#00bfff' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'Outfit' }}>
                        {selected.attachment.fileName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        Generato il {format(new Date(selected.attachment.createdAt), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Card>
          ) : (
            <Card sx={{
              background: 'rgba(10, 26, 38, 0.5)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 191, 255, 0.08)',
              borderRadius: 4,
              height: 'calc(100vh - 200px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 4,
            }}>
              <FileText size={52} style={{ color: 'rgba(0, 191, 255, 0.3)', marginBottom: 16 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontFamily: 'Outfit', mb: 1 }}>
                Nessun Consenso Selezionato
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, maxWidth: 380 }}>
                Seleziona un cliente dall'archivio a sinistra per visualizzare i dettagli del suo consenso informato e scaricare il PDF.
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
