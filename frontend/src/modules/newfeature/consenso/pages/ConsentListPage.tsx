"use client";

import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import Card from '@/common/components/ui/Card';
import Badge from '@/common/components/ui/Badge';
import Button from '@/common/components/ui/Button';
import Icon, { CheckCircle } from '@/common/components/ui/Icon';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/common/context/AuthContext';
import { useConsentConfig } from '../hooks/useConsentConfig';
import { useConsentList } from '../hooks/useConsentList';
import { useDebouncedValue } from '@/common/hooks/useDebouncedValue';
import PageHeader from '@/common/components/common/PageHeader';
import PageTransition from '@/common/components/layout/PageTransition';
import { consensoService } from '../service/consenso.service';
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
    return consensoService.getPdfUrl(record.attachment.filePath);
  };

  if (configLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={50} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (!isSuperAdmin || !SHOW_CONSENSI) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Box sx={{ mb: 2 }}>
          <Icon name="alertTriangle" size={64} color={theme.palette.error.main} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'common.white', fontFamily: 'Outfit' }}>
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
            background: (t) => `${t.palette.background.default}66`,
            border: 1,
            borderColor: 'divider',
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
            border: 1,
            borderColor: 'divider',
            flexGrow: 1,
            maxWidth: { md: '450px' },
            transition: 'all 0.2s',
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: (t) => `0 0 10px ${t.palette.primary.main}26`,
            }
          }}>
            <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0 }}>
              <Icon name="search" size={16} color={`${theme.palette.primary.main}99`} />
            </Box>
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
                color: 'common.white',
                fontSize: '0.85rem',
                fontFamily: 'Outfit',
                '&::placeholder': { color: (t) => `${t.palette.common.white}4d` },
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
                  size="sm"
                  sx={{
                    borderRadius: 3,
                    px: 2.5,
                    py: 0.75,
                    textTransform: 'none',
                    fontFamily: 'Outfit',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 800 : 500,
                    bgcolor: isActive ? (t) => `${t.palette.primary.main}1f` : 'rgba(255,255,255,0.02)',
                    border: isActive ? 1 : '1px solid rgba(255,255,255,0.05)',
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.main' : 'rgba(255,255,255,0.6)',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: isActive ? (t) => `${t.palette.primary.main}2e` : 'rgba(255,255,255,0.06)',
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
            <CircularProgress size={50} sx={{ color: 'primary.main' }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 8,             bgcolor: (t) => `${t.palette.error.main}0d`, border: 1, borderColor: 'error.main', borderOpacity: 0.15, borderRadius: 4, p: 4 }}>
          <Box sx={{ mx: 'auto', mb: 2 }}>
            <Icon name="alertTriangle" size={48} color={theme.palette.error.main} />
          </Box>
            <Typography variant="h6" sx={{ color: 'common.white', mb: 1, fontWeight: 700 }}>
              Errore nel caricamento dell'archivio
            </Typography>
            <Typography variant="body2" sx={{ color: (t) => `${t.palette.common.white}80` }}>
              Non è stato possibile caricare i dati dei consensi. Riprova più tardi.
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Card variant="minimal" sx={(t) => ({
            background: `${t.palette.background.default}4d`,
            border: 1,
            borderColor: 'divider',
            borderRadius: 5,
            p: 8,
            textAlign: 'center'
          })}>
            <Box sx={{ color: `${theme.palette.primary.main}40`, mb: 2.5 }}>
              <Icon name="fileText" size={64} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'common.white', mb: 1, fontFamily: 'Outfit' }}>
              Nessun consenso trovato
            </Typography>
            <Typography variant="body2" sx={{ color: (t) => `${t.palette.common.white}66`, maxWidth: 400, mx: 'auto' }}>
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
                    variant="minimal"
                    size="md"
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(10, 26, 40, 0.8) 0%, rgba(6, 15, 25, 0.9) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: c.hasMedicalAlerts 
                        ? 1 : 1,
                        borderColor: c.hasMedicalAlerts ? 'warning.main' : 'divider',
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
                          ? (t) => `0 12px 30px ${t.palette.warning.main}1f`
                          : (t) => `0 12px 30px ${t.palette.primary.main}26`,
                        borderColor: c.hasMedicalAlerts 
                          ? 'warning.main' 
                          : 'primary.main',
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
                        background: (t) => `linear-gradient(90deg, ${t.palette.warning.main}, ${t.palette.error.main})`
                      }} />
                    )}

                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Card Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: 'common.white', fontFamily: 'Outfit', mb: 0.5 }}>
                            {c.customerName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.4)' }}>
                            <Icon name="phone" size={12} />
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                              {c.phone || 'Nessun telefono'}
                            </Typography>
                          </Box>
                        </Box>
                        <Badge
                          variant="success"
                          icon={CheckCircle}
                          label="Firmato"
                          size="sm"
                        />
                      </Box>

                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1.5 }} />

                      {/* Info Rows */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'rgba(255,255,255,0.7)' }}>
                            <Icon name="user" size={14} color={theme.palette.primary.main} />
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            Artista: <strong style={{ color: '#fff' }}>{c.artistName ?? 'N/D'}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'rgba(255,255,255,0.7)' }}>
                          <Icon name="calendar" size={14} color={theme.palette.custom.purple} />
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            Data: <strong style={{ color: '#fff' }}>{format(new Date(c.date), 'dd MMMM yyyy, HH:mm', { locale: it })}</strong>
                          </Typography>
                        </Box>
                      </Box>

                      {/* Medical Alert warning block */}
                      {c.hasMedicalAlerts ? (
                        <Box sx={{
                          bgcolor: (t) => `${t.palette.warning.main}0d`,
                          border: 1,
                          borderColor: (t) => `${t.palette.warning.main}26`,
                          borderRadius: 2.5,
                          p: 1.5,
                          mt: 'auto',
                          mb: 2,
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Icon name="alertTriangle" size={14} color={theme.palette.warning.main} />
                            <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Alert Medici Rilevati
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', display: 'block', lineHeight: 1.5 }}>
                            {c.medicalAlertsDetails || 'Allergie o patologie segnalate dal cliente.'}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{
                          bgcolor: (t) => `${t.palette.success.main}08`,
                          border: 1,
                          borderColor: (t) => `${t.palette.success.main}14`,
                          borderRadius: 2.5,
                          p: 1.5,
                          mt: 'auto',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Icon name="shield" size={14} color={theme.palette.success.main} />
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                            Nessuna anomalia o allergia dichiarata.
                          </Typography>
                        </Box>
                      )}

                      {/* Download Button */}
                      {pdfUrl ? (
                        <Button
                          variant="ghost"
                          fullWidth
                          icon={<Icon name="externalLink" size={14} />}
                          onClick={() => window.open(pdfUrl, '_blank')}
                          sx={{
                            borderRadius: 3,
                            bgcolor: c.hasMedicalAlerts ? (t) => `${t.palette.warning.main}26` : (t) => `${t.palette.primary.main}1f`,
                            border: 1,
                            borderColor: c.hasMedicalAlerts ? 'warning.main' : 'primary.main',
                            color: c.hasMedicalAlerts ? 'warning.main' : 'primary.main',
                            fontWeight: 800,
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            py: 1,
                            boxShadow: 'none',
                            transition: 'all 0.25s',
                            '&:hover': {
                              bgcolor: c.hasMedicalAlerts ? 'warning.main' : 'primary.main',
                              color: (t) => t.palette.background.default,
                              boxShadow: c.hasMedicalAlerts 
                                ? (t) => `0 6px 16px ${t.palette.warning.main}4d`
                                : (t) => `0 6px 16px ${t.palette.primary.main}4d`,
                              borderColor: 'transparent'
                            },
                          }}
                        >
                          Apri PDF Firmato
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
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
                    </Box>
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
