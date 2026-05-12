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
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Download,
  Search,
  User,
  Calendar,
  Shield,
  Phone,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useConsentConfig } from '../hooks/useConsentConfig';
import { useConsentList } from '../hooks/useConsentList';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import PageHeader from '@/components/common/PageHeader';
import PageTransition from '@/components/layout/PageTransition';
import { API_BASE_URL } from '@/shared/api/endpoints';
import { ConsentRecord } from '../model/consent-list.types';

export default function ConsentListPage() {
  const theme = useTheme();
  const { isSuperAdmin } = useAuth();
  const { SHOW_CONSENSI, loading: configLoading } = useConsentConfig();
  const { data: consents, isLoading, error } = useConsentList();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'alerts' | 'clean'>('all');
  const debouncedSearch = useDebouncedValue(search, 300);

  // Filter and Search logic
  const filtered = useMemo(() => {
    let result = consents;

    // Apply tab filters
    if (filter === 'alerts') {
      result = result.filter(c => c.hasMedicalAlerts);
    } else if (filter === 'clean') {
      result = result.filter(c => !c.hasMedicalAlerts);
    }

    // Apply text search
    if (!debouncedSearch.trim()) return result;
    const q = debouncedSearch.toLowerCase().trim();
    return result.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        (c.artistName ?? '').toLowerCase().includes(q) ||
        (c.phone ?? '').toLowerCase().includes(q)
    );
  }, [consents, debouncedSearch, filter]);

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

  if (!isSuperAdmin || !SHOW_CONSENSI) {
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
    <PageTransition>
      <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: '1400px', margin: '0 auto' }}>
        <PageHeader
          title="Archivio Consensi Firmati"
          subtitle="Registro digitale di tutti i consensi informativi raccolti e firmati dai clienti"
        />

        {/* CONTROL BAR (Search & Quick Filters) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2.5,
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            mb: 4,
            p: 2,
            borderRadius: 4,
            background: 'rgba(10, 26, 40, 0.4)',
            border: '1px solid rgba(0, 191, 255, 0.08)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Search Field */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.25,
            borderRadius: 3,
            bgcolor: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(0, 191, 255, 0.1)',
            flexGrow: 1,
            maxWidth: { md: '450px' },
            transition: 'all 0.2s',
            '&:focus-within': {
              borderColor: '#00bfff',
              boxShadow: '0 0 10px rgba(0, 191, 255, 0.15)',
            }
          }}>
            <Search size={16} style={{ color: 'rgba(0, 191, 255, 0.6)', flexShrink: 0 }} />
            <Box
              component="input"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Cerca cliente, artista o telefono..."
              sx={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontFamily: 'Outfit',
                '&::placeholder': { color: 'rgba(255,255,255,0.3)' },
              }}
            />
          </Box>

          {/* Filter Tabs */}
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: { xs: 1, md: 0 } }}>
            {[
              { id: 'all', label: 'Tutti i Consensi', count: consents.length },
              { id: 'alerts', label: 'Con Alert Medici', count: consents.filter(c => c.hasMedicalAlerts).length },
              { id: 'clean', label: 'Senza Alert', count: consents.filter(c => !c.hasMedicalAlerts).length },
            ].map((btn) => {
              const isActive = filter === btn.id;
              return (
                <Button
                  key={btn.id}
                  onClick={() => setFilter(btn.id as any)}
                  size="small"
                  sx={{
                    borderRadius: 3,
                    px: 2.5,
                    py: 0.75,
                    textTransform: 'none',
                    fontFamily: 'Outfit',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 800 : 500,
                    bgcolor: isActive ? 'rgba(0, 191, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                    border: isActive ? '1px solid #00bfff' : '1px solid rgba(255,255,255,0.05)',
                    color: isActive ? '#00bfff' : 'rgba(255,255,255,0.6)',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(0, 191, 255, 0.18)' : 'rgba(255,255,255,0.06)',
                    }
                  }}
                >
                  {btn.label} ({btn.count})
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* MAIN GRID */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress size={50} sx={{ color: '#00bfff' }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'rgba(244,67,54,0.05)', border: '1px solid rgba(244,67,54,0.15)', borderRadius: 4, p: 4 }}>
            <AlertTriangle size={48} color={theme.palette.error.main} style={{ margin: '0 auto 16px' }} />
            <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 700 }}>
              Errore nel caricamento dell'archivio
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Non è stato possibile caricare i dati dei consensi. Riprova più tardi.
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Card sx={{
            background: 'rgba(10, 26, 38, 0.3)',
            border: '1px solid rgba(0, 191, 255, 0.08)',
            borderRadius: 5,
            p: 8,
            textAlign: 'center'
          }}>
            <FileText size={64} style={{ color: 'rgba(0, 191, 255, 0.25)', marginBottom: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', mb: 1, fontFamily: 'Outfit' }}>
              Nessun consenso trovato
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', maxWidth: 400, mx: 'auto' }}>
              Nessun documento corrisponde ai criteri di ricerca impostati. Prova a cambiare parole chiave o filtri.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((c) => {
              const pdfUrl = getPdfUrl(c);
              return (
                <Grid key={c.bookingId} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(10, 26, 40, 0.8) 0%, rgba(6, 15, 25, 0.9) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: c.hasMedicalAlerts 
                        ? '1px solid rgba(255, 152, 0, 0.25)' 
                        : '1px solid rgba(0, 191, 255, 0.12)',
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: c.hasMedicalAlerts
                          ? '0 12px 30px rgba(255, 152, 0, 0.12)'
                          : '0 12px 30px rgba(0, 191, 255, 0.15)',
                        borderColor: c.hasMedicalAlerts 
                          ? 'rgba(255, 152, 0, 0.5)' 
                          : 'rgba(0, 191, 255, 0.4)',
                      },
                    }}
                  >
                    {/* Glowing accent border for Alerts */}
                    {c.hasMedicalAlerts && (
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #ff9800, #ff5722)'
                      }} />
                    )}

                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Card Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontFamily: 'Outfit', mb: 0.5 }}>
                            {c.customerName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.4)' }}>
                            <Phone size={12} />
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                              {c.phone || 'Nessun telefono'}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          icon={<CheckCircle size={12} style={{ color: '#4caf50' }} />}
                          label="Firmato"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(76,175,80,0.1)',
                            color: '#4caf50',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            border: '1px solid rgba(76,175,80,0.2)',
                            px: 0.5
                          }}
                        />
                      </Box>

                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1.5 }} />

                      {/* Info Rows */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'rgba(255,255,255,0.7)' }}>
                          <User size={14} style={{ color: '#00bfff' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            Artista: <strong style={{ color: '#fff' }}>{c.artistName ?? 'N/D'}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'rgba(255,255,255,0.7)' }}>
                          <Calendar size={14} style={{ color: '#ce93d8' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            Data: <strong style={{ color: '#fff' }}>{format(new Date(c.date), 'dd MMMM yyyy, HH:mm', { locale: it })}</strong>
                          </Typography>
                        </Box>
                      </Box>

                      {/* Medical Alert warning block */}
                      {c.hasMedicalAlerts ? (
                        <Box sx={{
                          bgcolor: 'rgba(255,152,0,0.05)',
                          border: '1px solid rgba(255,152,0,0.15)',
                          borderRadius: 2.5,
                          p: 1.5,
                          mt: 'auto',
                          mb: 2,
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <AlertTriangle size={14} color="#ff9800" />
                            <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Alert Medici Rilevati
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', display: 'block', lineHeight: 1.5 }}>
                            {c.medicalAlertsDetails || 'Allergie o patologie segnalate dal cliente.'}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{
                          bgcolor: 'rgba(76,175,80,0.03)',
                          border: '1px solid rgba(76,175,80,0.08)',
                          borderRadius: 2.5,
                          p: 1.5,
                          mt: 'auto',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Shield size={14} color="#4caf50" />
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                            Nessuna anomalia o allergia dichiarata.
                          </Typography>
                        </Box>
                      )}

                      {/* Download Button */}
                      {pdfUrl ? (
                        <Button
                          variant="contained"
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          fullWidth
                          startIcon={<ExternalLink size={14} />}
                          sx={{
                            borderRadius: 3,
                            bgcolor: c.hasMedicalAlerts ? 'rgba(255, 152, 0, 0.15)' : 'rgba(0, 191, 255, 0.12)',
                            border: c.hasMedicalAlerts ? '1px solid rgba(255, 152, 0, 0.3)' : '1px solid rgba(0, 191, 255, 0.3)',
                            color: c.hasMedicalAlerts ? '#ff9800' : '#00bfff',
                            fontWeight: 800,
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            py: 1,
                            boxShadow: 'none',
                            transition: 'all 0.25s',
                            '&:hover': {
                              bgcolor: c.hasMedicalAlerts ? '#ff9800' : '#00bfff',
                              color: '#060b13',
                              boxShadow: c.hasMedicalAlerts 
                                ? '0 6px 16px rgba(255, 152, 0, 0.3)'
                                : '0 6px 16px rgba(0, 191, 255, 0.3)',
                              borderColor: 'transparent'
                            },
                          }}
                        >
                          Apri PDF Firmato
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          disabled
                          fullWidth
                          sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            py: 1,
                          }}
                        >
                          PDF Non Disponibile
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </PageTransition>
  );
}
