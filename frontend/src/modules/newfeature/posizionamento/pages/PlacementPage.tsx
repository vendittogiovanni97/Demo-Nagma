"use client";

import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Button,
  useTheme,
  InputAdornment,
  Divider
} from '@mui/material';
import { Search, Calendar, User, Eye, Save, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useConsentConfig } from '@/modules/newfeature/consenso/hooks/useConsentConfig';
import { useBookings } from '@/modules/booking/hooks/useBooking';
import { useBookingPlacement } from '../hooks/useBookingPlacement';
import BodyMap from '../components/BodyMap';
import PageHeader from '@/components/common/PageHeader';
import PageTransition from '@/components/layout/PageTransition';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePaginationFilters } from '@/hooks/usePaginationFilters';
import { toast } from 'react-hot-toast';

export default function PlacementPage() {
  const theme = useTheme();
  const { isSuperAdmin } = useAuth();
  const { SHOW_POSIZIONAMENTO, loading: configLoading } = useConsentConfig();

  // Selected Booking
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const {
    page,
    startDate,
    endDate
  } = usePaginationFilters();

  // Fetch Bookings list (Standard pagination parameters)
  const { data: bookingsData, isLoading: bookingsLoading, mutate: mutateBookings } = useBookings({
    page,
    limit: 100,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    enabled: SHOW_POSIZIONAMENTO && isSuperAdmin
  });

  const bookings = bookingsData?.data || [];

  // Filter bookings locally by search query
  const filteredBookings = useMemo(() => {
    if (!debouncedSearch.trim()) return bookings;
    const query = debouncedSearch.toLowerCase().trim();
    return bookings.filter(b => 
      b.customer?.firstName?.toLowerCase().includes(query) ||
      b.customer?.lastName?.toLowerCase().includes(query) ||
      b.artist?.name?.toLowerCase().includes(query)
    );
  }, [bookings, debouncedSearch]);

  const selectedBooking = useMemo(() => {
    return bookings.find(b => b.id === selectedBookingId) || null;
  }, [bookings, selectedBookingId]);

  // Hook for saving / loading selected placement
  const {
    placement,
    setPlacement,
    loading: placementLoading,
    savePlacement
  } = useBookingPlacement(
    selectedBooking?.id,
    SHOW_POSIZIONAMENTO,
    selectedBooking?.formData?.placement
  );

  const handleSave = async () => {
    if (!selectedBookingId) return;
    try {
      await savePlacement(selectedBookingId);
      toast.success('Mappa corporea salvata con successo!');
      await mutateBookings();
    } catch {
      toast.error('Errore durante il salvataggio della mappa corporea');
    }
  };

  // Lock access to Super Admin with feature toggle active
  if (configLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={50} sx={{ color: '#00bfff' }} />
      </Box>
    );
  }

  if (!isSuperAdmin || !SHOW_POSIZIONAMENTO) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <AlertTriangle size={64} color={theme.palette.error.main} style={{ marginBottom: 16 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#ffffff', fontFamily: 'Outfit' }}>
          Accesso Non Autorizzato
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, textAlign: 'center', maxWidth: 450 }}>
          Questa funzionalità protetta è riservata esclusivamente ai Super Admin ed è soggetta all'attivazione del toggle globale di posizionamento.
        </Typography>
      </Box>
    );
  }

  return (
    <PageTransition>
      <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: '1400px', margin: '0 auto' }}>
        <PageHeader
          title="Scheda di Posizionamento"
          subtitle="Identifica graficamente e in modo digitale la zona anatomica di ciascun tatuaggio"
        />

      <Grid container spacing={4} sx={{ mt: 1 }}>
        {/* LEFT SIDEBAR: BOOKINGS LIST */}
        <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(10, 26, 40, 0.6) 0%, rgba(6, 15, 25, 0.8) 100%)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(0, 191, 255, 0.15)',
            borderRadius: 5,
            height: 'calc(100vh - 220px)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
          }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0, 191, 255, 0.1)' }}>
              <Typography variant="caption" sx={{ color: 'rgba(0, 191, 255, 0.8)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5, display: 'block', fontFamily: 'Outfit' }}>
                Appuntamenti ({filteredBookings.length})
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca cliente o artista..."
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={16} style={{ color: 'rgba(0, 191, 255, 0.6)' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 3,
                      bgcolor: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(0, 191, 255, 0.08)',
                      color: '#ffffff',
                      '&:hover': { border: '1px solid rgba(0, 191, 255, 0.2)' }
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5, gap: 1.5, display: 'flex', flexDirection: 'column' }}>
              {bookingsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={30} sx={{ color: '#00bfff' }} />
                </Box>
              ) : filteredBookings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'Outfit' }}>
                    Nessun appuntamento trovato.
                  </Typography>
                </Box>
              ) : (
                filteredBookings.map((b) => {
                  const isSelected = b.id === selectedBookingId;
                  const hasPlacement = !!b.formData?.placement || false;

                  return (
                    <Card
                      key={b.id}
                      onClick={() => setSelectedBookingId(b.id)}
                      sx={{
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(0, 191, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? '1px solid #00bfff' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 3.5,
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        mx: 0.5,
                        '&:hover': {
                          background: isSelected ? 'rgba(0, 191, 255, 0.16)' : 'rgba(255, 255, 255, 0.05)',
                          borderColor: isSelected ? '#00bfff' : 'rgba(0, 191, 255, 0.3)',
                          transform: 'translateY(-2px)',
                          boxShadow: isSelected ? '0 4px 20px rgba(0, 191, 255, 0.15)' : '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: '14px !important' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit', fontSize: '0.9375rem' }}>
                            {b.customer?.firstName} {b.customer?.lastName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#00bfff', fontWeight: 800, bgcolor: 'rgba(0, 191, 255, 0.1)', px: 1.2, py: 0.35, borderRadius: 1.5, textTransform: 'uppercase', fontSize: '0.625rem', letterSpacing: '0.05em' }}>
                            {b.artist?.name}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255, 255, 255, 0.45)', mb: 1 }}>
                          <Calendar size={12} style={{ color: 'rgba(0, 191, 255, 0.5)' }} />
                          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                            {format(new Date(b.date), "eeee d MMMM yyyy, HH:mm", { locale: it })}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderTop: '1px solid rgba(255,255,255,0.03)', pt: 1, mt: 0.5 }}>
                          <Box sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: hasPlacement ? '#25D366' : 'rgba(255,255,255,0.2)',
                            boxShadow: hasPlacement ? '0 0 6px #25D366' : 'none'
                          }} />
                          <Typography variant="caption" sx={{ color: hasPlacement ? '#25D366' : 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: '0.6875rem' }}>
                            {hasPlacement ? 'Posizionamento Salvato' : 'Da configurare'}
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

        {/* RIGHT BOARD: INTERACTIVE SCANNER & EDITOR */}
        <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
          {selectedBooking ? (
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(10, 26, 40, 0.65) 0%, rgba(6, 15, 25, 0.85) 100%)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(0, 191, 255, 0.15)',
              borderRadius: 5,
              p: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit' }}>
                    Scheda di: {selectedBooking.customer?.firstName} {selectedBooking.customer?.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                    Appuntamento con {selectedBooking.artist?.name} il {format(new Date(selectedBooking.date), "dd/MM/yyyy 'alle' HH:mm")}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={placementLoading}
                  startIcon={placementLoading ? <CircularProgress size={16} /> : <Save size={16} />}
                  sx={{
                    borderRadius: '12px',
                    bgcolor: '#00bfff',
                    color: '#060b13',
                    fontWeight: 800,
                    textTransform: 'none',
                    px: 3.5,
                    py: 1.2,
                    fontFamily: 'Outfit',
                    boxShadow: '0 4px 14px rgba(0, 191, 255, 0.4)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#009acd',
                      boxShadow: '0 6px 20px rgba(0, 191, 255, 0.6)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Salva Mappa
                </Button>
              </Box>

              <Divider sx={{ mb: 3, borderColor: 'rgba(0, 191, 255, 0.08)' }} />

              {/* RENDER THE MAJESTIC INTERACTIVE SCANNER MODEL */}
              <Box sx={{ mt: 1 }}>
                <BodyMap value={placement} onChange={setPlacement} />
              </Box>
            </Card>
          ) : (
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(10, 26, 40, 0.5) 0%, rgba(6, 15, 25, 0.7) 100%)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(0, 191, 255, 0.08)',
              borderRadius: 5,
              height: 'calc(100vh - 220px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 6,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                borderColor: 'rgba(0, 191, 255, 0.15)',
                boxShadow: '0 8px 32px 0 rgba(0, 191, 255, 0.05)'
              }
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, rgba(155, 109, 255, 0.05) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0, 191, 255, 0.25)',
                boxShadow: '0 0 20px rgba(0, 191, 255, 0.1)',
                mb: 3,
                position: 'relative',
                animation: 'pulse 3s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(0, 191, 255, 0.1)' },
                  '50%': { transform: 'scale(1.05)', boxShadow: '0 0 30px rgba(0, 191, 255, 0.2)' }
                }
              }}>
                <Eye size={36} style={{ color: '#00bfff' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit', mb: 1.5, letterSpacing: '-0.02em' }}>
                Nessuna Prenotazione Selezionata
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 420, mx: 'auto', lineHeight: 1.6 }}>
                Scegli un cliente dall'elenco a sinistra per visualizzare la scheda tecnica di posizionamento anatomico e apporre i relativi tag grafici e note digitali.
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>
      </Box>
    </PageTransition>
  );
}
