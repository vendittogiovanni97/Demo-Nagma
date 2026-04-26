"use client";

import dynamic from 'next/dynamic';

import DataTable, { type Column } from '@/components/data-display/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { creamService, type CreamSale } from '@/services/cream.service';
import { teamService } from '@/services/team.service';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Hash, Package, Plus, User, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

const Modal = dynamic(
  () => import('@/components/modals/Modal'),
  { ssr: false }
);

interface CreamInfo {
  id: number;
  name: string;
  description: string | null;
}

interface StaffMember {
  id: number;
  name: string;
  type: 'COLLABORATORE' | 'APPRENDISTA';
  color?: string;
}

export default function CreamsPage() {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [artistFilter, setArtistFilter] = useState<number | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const toast = useToast();

  const filters = useMemo(() => ({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    artistId: artistFilter || undefined,
  }), [startDate, endDate, artistFilter]);

  const { data: creamData } = useSWR<CreamInfo>(
    'cream-active',
    () => creamService.getActive(),
    { revalidateOnFocus: false }
  );

  const { data: salesData, isLoading: salesLoading, mutate: mutateSales } = useSWR<{
    data: CreamSale[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(
    creamData ? ['cream-sales', creamData.id, page, filters] : null,
    () => {
      const id = creamData?.id;
      if (!id) throw new Error('No cream ID');
      return creamService.getSales(id, page, 20, filters);
    },
    { revalidateOnFocus: false }
  );

  const { data: teamMembers } = useSWR<StaffMember[]>(
    'team-members',
    () => teamService.getMembers({ limit: 100 }).then((res) => res.data),
    { revalidateOnFocus: false }
  );

  const handleSearch = () => {
    setPage(1);
    mutateSales();
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setArtistFilter('');
    setPage(1);
    mutateSales();
  };

  const handleCreateSale = async () => {
    if (!creamData || !selectedArtistId) {
      toast.error('Seleziona un artista');
      return;
    }

    try {
      await creamService.createSale({
        creamId: creamData.id,
        artistId: selectedArtistId,
        quantity,
      });
      toast.success('Vendita registrata!');
      setIsModalOpen(false);
      setSelectedArtistId(0);
      setQuantity(1);
      mutateSales();
    } catch {
      toast.error('Errore nella registrazione');
    }
  };

  const columns: Column<CreamSale>[] = [
    {
      key: 'soldAt',
      label: 'Data',
      width: '140px',
      render: (row) => (
        <Box sx={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
          {format(new Date(row.soldAt), 'dd MMM yyyy', { locale: it })}
        </Box>
      ),
    },
    {
      key: 'artist',
      label: 'Artista',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: row.artist.color || theme.palette.primary.main,
              flexShrink: 0,
              boxShadow: `0 0 0 1px ${theme.palette.text.disabled}`,
            }}
          />
          <Box sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
            {row.artist.name}
          </Box>
        </Box>
      ),
    },
    {
      key: 'quantity',
      label: 'Qtà',
      width: '80px',
      align: 'center',
      render: (row) => (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: `${theme.palette.primary.main}26`,
            color: theme.palette.primary.main,
            fontWeight: 700,
            fontSize: '0.875rem',
          }}
        >
          {row.quantity}
        </Box>
      ),
    },
  ];

  const totalPages = salesData?.totalPages ?? 1;

  const hasFilters = startDate || endDate || artistFilter;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Vendite Crema Tattoo"
        actions={
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            Nuova Vendita
          </Button>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="label"
              sx={{
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              Dal:
            </Box>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disableUnderline
              sx={{
                borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'rgba(255,255,255,0.05)',
                px: 1.5,
                py: 1,
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
                outline: 'none',
                transition: 'all 0.3s ease',
                '&:focus': {
                  borderColor: theme.palette.primary.main,
                },
                '& .MuiInput-input': {
                  '&::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)',
                  },
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="label"
              sx={{
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              Al:
            </Box>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disableUnderline
              sx={{
                borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'rgba(255,255,255,0.05)',
                px: 1.5,
                py: 1,
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
                outline: 'none',
                transition: 'all 0.3s ease',
                '&:focus': {
                  borderColor: theme.palette.primary.main,
                },
                '& .MuiInput-input': {
                  '&::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)',
                  },
                },
              }}
            />
          </Box>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value ? Number(e.target.value) : '')}
              displayEmpty
              sx={{
                borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'rgba(255,255,255,0.05)',
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
                outline: 'none',
                transition: 'all 0.3s ease',
                '&:focus': {
                  borderColor: theme.palette.primary.main,
                },
                '& .MuiSelect-select': {
                  py: 1,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
              }}
            >
              <MenuItem value="">Tutti gli artisti</MenuItem>
              {teamMembers?.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name} ({member.type === 'APPRENDISTA' ? 'Appr.' : 'Coll.'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="primary" size="sm" onClick={handleSearch}>
            Filtra
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset} icon={<X size={14} />}>
              Reset
            </Button>
          )}
        </Box>
      </PageHeader>

      {creamData && (
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            bgcolor: 'rgba(26, 35, 50, 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2.5,
              bgcolor: `${theme.palette.primary.main}1a`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: theme.palette.primary.main,
            }}
          >
            <Package size={28} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              component="h2"
              sx={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {creamData.name}
            </Box>
            {creamData.description && (
              <Box
                sx={{
                  fontSize: '0.875rem',
                  color: theme.palette.text.secondary,
                  mt: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {creamData.description}
              </Box>
            )}
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Box
              sx={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: theme.palette.primary.main,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {salesData?.total ?? 0}
            </Box>
            <Box
              sx={{
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Vendute
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ flex: 1 }}>
        <DataTable
          data={salesData?.data ?? []}
          columns={columns}
          isLoading={salesLoading}
          emptyMessage={hasFilters ? "Nessuna vendita trovata per i filtri selezionati." : "Nessuna vendita registrata. Clicca 'Nuova Vendita' per iniziare."}
          keyExtractor={(row) => row.id}
          pageSize={7}
        />
      </Box>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedArtistId(0);
          setQuantity(1);
        }}
        title="Registra Vendita"
        maxWidth="sm"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 2,
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Package size={20} color={theme.palette.primary.main} />
            <Box sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
              {creamData?.name}
            </Box>
          </Box>

          <Box>
            <Box
              component="label"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                mb: 1,
              }}
            >
              <User size={14} />
              Artista
            </Box>
            <FormControl fullWidth size="small">
              <Select
                value={selectedArtistId}
                onChange={(e) => setSelectedArtistId(Number(e.target.value))}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent',
                  },
                  '&:focus': {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <MenuItem value={0}>Seleziona artista...</MenuItem>
                {teamMembers?.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name} ({member.type === 'APPRENDISTA' ? 'Apprendista' : 'Collaboratore'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Box
              component="label"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                mb: 1,
              }}
            >
              <Hash size={14} />
              Quantità
            </Box>
            <Input
              type="number"
              inputProps={{ min: 1 }}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              fullWidth
              disableUnderline
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                px: 2,
                py: 1.5,
                color: theme.palette.text.primary,
                fontFamily: 'monospace',
                fontSize: '1.125rem',
                textAlign: 'center',
                '&:focus': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, pt: 0.5 }}>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedArtistId(0);
                setQuantity(1);
              }}
              sx={{ flex: 1 }}
            >
              Annulla
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSale}
              disabled={!selectedArtistId}
              sx={{ flex: 1 }}
            >
              Registra
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
