'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { alpha, useTheme } from '@mui/material/styles';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Clock, Armchair, Palette, CreditCard, CheckCircle2, Search, RefreshCw, Filter } from 'lucide-react';
import { useKanbanBookings, KanbanStage, KanbanBookingItem } from '../hooks/useKanbanBookings';
import { KanbanCard } from './KanbanCard';
import { useStaffMembers } from '@/modules/staff/hooks/useStaff';
import { formatPrice } from '@/common/shared/utils/format';
import { KANBAN_STAGE_COLORS } from '@/common/theme/colorTokens';

const KANBAN_COLUMNS: { id: KanbanStage; title: string; icon: React.ReactNode; color: string }[] = [
  { id: 'IN_ARRIVO', title: 'In Arrivo', icon: <Clock size={18} />, color: KANBAN_STAGE_COLORS.IN_ARRIVO },
  { id: 'IN_ATTESA', title: "In Sala d'Attesa", icon: <Armchair size={18} />, color: KANBAN_STAGE_COLORS.IN_ATTESA },
  { id: 'IN_SEDUTA', title: 'In Seduta', icon: <Palette size={18} />, color: KANBAN_STAGE_COLORS.IN_SEDUTA },
  { id: 'DA_SALDARE', title: 'Da Saldare', icon: <CreditCard size={18} />, color: KANBAN_STAGE_COLORS.DA_SALDARE },
  { id: 'SALDATO', title: 'Saldato & Uscito', icon: <CheckCircle2 size={18} />, color: KANBAN_STAGE_COLORS.SALDATO },
];

export function KanbanBoard() {
  const theme = useTheme();
  const { bookings, isLoading, moveBooking, refresh } = useKanbanBookings();
  const { data: staffData } = useStaffMembers({ limit: 100 });
  const staffMembers = staffData?.data || [];

  const [search, setSearch] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState<string>('ALL');

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedArtistId !== 'ALL' && b.artistId !== Number(selectedArtistId)) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const customerName = b.customer
          ? `${b.customer.firstName} ${b.customer.lastName || ''}`.toLowerCase()
          : '';
        const phone = b.customer?.phone || '';
        const artistName = b.artist?.name.toLowerCase() || '';
        return customerName.includes(query) || phone.includes(query) || artistName.includes(query);
      }
      return true;
    });
  }, [bookings, search, selectedArtistId]);

  const columnsData = useMemo(() => {
    const map: Record<KanbanStage, KanbanBookingItem[]> = {
      IN_ARRIVO: [],
      IN_ATTESA: [],
      IN_SEDUTA: [],
      DA_SALDARE: [],
      SALDATO: [],
    };

    filteredBookings.forEach((b) => {
      const stage = (b.kanbanStage as KanbanStage) || 'IN_ARRIVO';
      if (map[stage]) {
        map[stage].push(b);
      } else {
        map.IN_ARRIVO.push(b);
      }
    });

    return map;
  }, [filteredBookings]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const bookingId = Number(draggableId);
    const targetStage = destination.droppableId as KanbanStage;

    moveBooking(bookingId, targetStage);
  };

  const handleOpenPayment = (booking: KanbanBookingItem) => {
    moveBooking(booking.id, 'SALDATO');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 200px)', gap: 2 }}>
      {/* Control Bar: Ricerca & Filtri Artista */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justify: 'space-between',
          gap: 2,
          p: 2,
          borderRadius: 3,
          bgcolor: (t) => alpha(t.palette.background.paper, 0.8),
          border: '1px solid',
          borderColor: (t) => alpha(t.palette.divider, 0.1),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flex: 1 }}>
          <TextField
            size="small"
            placeholder="Cerca cliente, telefono o artista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 260 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            select
            size="small"
            label="Filtra Artista"
            value={selectedArtistId}
            onChange={(e) => setSelectedArtistId(e.target.value)}
            sx={{ minWidth: 200 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Filter size={16} />
                  </InputAdornment>
                ),
              },
            }}
          >
            <MenuItem value="ALL">Tutti gli Artisti</MenuItem>
            {(staffMembers || []).map((s: any) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.name} {s.isRentPayee ? '(Affitto)' : ''}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isLoading && <CircularProgress size={20} />}
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshCw size={14} />}
            onClick={() => refresh()}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Aggiorna
          </Button>
        </Box>
      </Box>

      {/* Tabellone Kanban Drag & Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 2,
            alignItems: 'start',
            overflowX: 'auto',
            pb: 2,
          }}
        >
          {KANBAN_COLUMNS.map((col) => {
            const colItems = columnsData[col.id];
            const colTotalBalance = colItems.reduce((acc, curr) => acc + curr.outstandingBalance, 0);

            return (
              <Box
                key={col.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2,
                  minHeight: { xs: 520, md: 'calc(100vh - 280px)' },
                  borderRadius: 3,
                  bgcolor: (t) => alpha(t.palette.background.paper, 0.6),
                  border: '1px dashed',
                  borderColor: alpha(col.color, 0.3),
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Header Colonna (Posizionato all'esterno del Droppable) */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: col.color, display: 'flex' }}>{col.icon}</Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {col.title}
                    </Typography>
                  </Box>

                  <Chip
                    label={colItems.length}
                    size="small"
                    sx={{
                      height: 22,
                      fontWeight: 800,
                      bgcolor: alpha(col.color, 0.2),
                      color: col.color,
                    }}
                  />
                </Box>

                {colTotalBalance > 0 && col.id === 'DA_SALDARE' && (
                  <Typography variant="caption" color="warning.main" sx={{ mb: 1, fontWeight: 700 }}>
                    Totale da incassare: {formatPrice(colTotalBalance)}
                  </Typography>
                )}

                {/* Area Droppable per il drag & drop delle schede */}
                <Droppable
                  droppableId={col.id}
                  ignoreContainerClipping={true}
                  renderClone={(provided, snapshot, rubric) => {
                    const booking = colItems[rubric.source.index];
                    if (!booking) return null as any;
                    return (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          opacity: 0.95,
                          cursor: 'grabbing',
                          boxShadow: (t) =>
                            t.palette.mode === 'dark'
                              ? `0 16px 36px ${alpha(t.palette.common.black, 0.6)}`
                              : `0 12px 28px ${alpha(t.palette.common.black, 0.15)}`,
                        }}
                      >
                        <KanbanCard booking={booking} />
                      </Box>
                    );
                  }}
                >
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        borderRadius: 2,
                        p: 0.5,
                        bgcolor: snapshot.isDraggingOver ? alpha(col.color, 0.12) : 'transparent',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {colItems.map((booking, index) => (
                        <Draggable key={booking.id} draggableId={String(booking.id)} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <Box
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              sx={{
                                opacity: dragSnapshot.isDragging ? 0.85 : 1,
                                cursor: 'grab',
                                '&:active': { cursor: 'grabbing' },
                              }}
                            >
                              <KanbanCard booking={booking} onOpenPayment={handleOpenPayment} />
                            </Box>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}

                      {colItems.length === 0 && !snapshot.isDraggingOver && (
                        <Box
                          sx={{
                            flex: 1,
                            minHeight: 220,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            borderRadius: 2.5,
                            border: '1px dashed',
                            borderColor: alpha(col.color, 0.2),
                            bgcolor: alpha(col.color, 0.03),
                            textAlign: 'center',
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              p: 1.2,
                              borderRadius: '50%',
                              bgcolor: alpha(col.color, 0.1),
                              color: col.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Clock size={20} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.82rem' }}>
                            Nessun appuntamento
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
                            Trascina qui per spostare
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Droppable>
              </Box>
            );
          })}
        </Box>
      </DragDropContext>
    </Box>
  );
}
