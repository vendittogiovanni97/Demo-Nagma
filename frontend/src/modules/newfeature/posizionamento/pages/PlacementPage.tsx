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
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePaginationFilters } from '@/hooks/usePaginationFilters';
import { toast } from 'react-hot-toast';

export default function PlacementPage() {
  const theme = useTheme();
  const { isSuperAdmin } = useAuth();
  const { showPosizionamento, loading: configLoading } = useConsentConfig();

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
    enabled: showPosizionamento && isSuperAdmin
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
    showPosizionamento,
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

  if (!isSuperAdmin || !showPosizionamento) {
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
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '90vh', backgroundColor: '#060b13' }}>
      <PageHeader
        title="Scheda di Posizionamento"
        subtitle="Identifica graficamente e in modo digitale la zona anatomica di ciascun tatuaggio"
      />

      <Grid container spacing={4} sx={{ mt: 1 }}>
        {/* LEFT SIDEBAR: BOOKINGS LIST */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{
            background: 'rgba(10, 26, 38, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 191, 255, 0.12)',
            borderRadius: 4,
            height: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 191, 255, 0.08)' }}>
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
                      bgcolor: 'rgba(0, 0, 0, 0.2)',
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
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                    Nessun appuntamento trovato.
                  </Typography>
                </Box>
              ) : (
                filteredBookings.map((b) => {
                  const isSelected = b.id === selectedBookingId;
                  return (
                    <Card
                      key={b.id}
                      onClick={() => setSelectedBookingId(b.id)}
                      sx={{
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(0, 191, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? '1px solid #00bfff' : '1px solid rgba(0, 191, 255, 0.05)',
                        borderRadius: 3,
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: isSelected ? 'rgba(0, 191, 255, 0.16)' : 'rgba(0, 191, 255, 0.05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 20px rgba(0, 191, 255, 0.1)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: '12px !important' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit' }}>
                            {b.customer?.firstName} {b.customer?.lastName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#00bfff', fontWeight: 700, bgcolor: 'rgba(0, 191, 255, 0.1)', px: 1, py: 0.25, borderRadius: 1 }}>
                            {b.artist?.name}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255, 255, 255, 0.5)' }}>
                          <Calendar size={12} />
                          <Typography variant="caption">
                            {format(new Date(b.date), "eeee d MMMM yyyy, HH:mm", { locale: it })}
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
        <Grid size={{ xs: 12, md: 8 }}>
          {selectedBooking ? (
            <Card sx={{
              background: 'rgba(10, 26, 38, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 191, 255, 0.12)',
              borderRadius: 4,
              p: 3,
              position: 'relative'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit' }}>
                    Scheda di: {selectedBooking.customer?.firstName} {selectedBooking.customer?.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Appuntamento con {selectedBooking.artist?.name} il {format(new Date(selectedBooking.date), "dd/MM/yyyy 'alle' HH:mm")}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={placementLoading}
                  startIcon={placementLoading ? <CircularProgress size={16} /> : <Save size={16} />}
                  sx={{
                    borderRadius: 3,
                    bgcolor: '#00bfff',
                    color: '#060b13',
                    fontWeight: 800,
                    textTransform: 'none',
                    px: 3,
                    boxShadow: '0 4px 14px rgba(0, 191, 255, 0.4)',
                    '&:hover': {
                      bgcolor: '#009acd',
                      boxShadow: '0 6px 20px rgba(0, 191, 255, 0.6)'
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
              p: 4
            }}>
              <Eye size={48} style={{ color: 'rgba(0, 191, 255, 0.4)', marginBottom: 16 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit', mb: 1 }}>
                Nessuna Prenotazione Selezionata
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, maxWidth: 380 }}>
                Seleziona un appuntamento dall'elenco a sinistra per visualizzare, contrassegnare o modificare il posizionamento e le note anatomiche.
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
