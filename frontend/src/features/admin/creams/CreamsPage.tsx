'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Package, Plus, X } from 'lucide-react';
import { Box, TextField, Select, MenuItem, FormControl } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import DataTable from '@/components/data-display/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { creamService, type CreamSale } from '@/services/cream.service';
import { teamService } from '@/services/team.service';
import SaleModal from './components/SaleModal';
import { useCreamColumns } from './hooks/useCreamColumns';

interface StaffMember {
  id: number;
  name: string;
  type: 'COLLABORATORE' | 'APPRENDISTA';
  color?: string;
}

interface CreamInfo {
  id: number;
  name: string;
  description: string | null;
}

export default function CreamsPage() {
  const theme = useTheme();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [artistFilter, setArtistFilter] = useState<number | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const columns = useCreamColumns();
  const hasFilters = startDate || endDate || artistFilter;

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setArtistFilter('');
    setPage(1);
    mutateSales();
  };

  const handleCreateSale = async (artistId: number, quantity: number) => {
    if (!creamData) return;
    try {
      await creamService.createSale({ creamId: creamData.id, artistId, quantity });
      toast.success('Vendita registrata!');
      mutateSales();
    } catch {
      toast.error('Errore nella registrazione');
    }
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Vendite Crema Tattoo"
        actions={
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
            Nuova Vendita
          </Button>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            label="Dal"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            size="small"
            sx={{ width: '140px' }}
          />
          <TextField
            label="Al"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            size="small"
            sx={{ width: '140px' }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value ? Number(e.target.value) : '')}
              displayEmpty
              sx={{
                borderRadius: 1.5,
                bgcolor: 'rgba(255,255,255,0.05)',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
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
          <Button variant="primary" size="sm" onClick={() => setPage(1)}>
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
            <Box component="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, color: theme.palette.text.primary }}>
              {creamData.name}
            </Box>
            {creamData.description && (
              <Box sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary, mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {creamData.description}
              </Box>
            )}
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.primary.main }}>
              {salesData?.total ?? 0}
            </Box>
            <Box sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
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
          emptyMessage={hasFilters ? "Nessuna vendita trovata." : "Nessuna vendita registrata."}
          keyExtractor={(row) => row.id}
          pageSize={7}
        />
      </Box>

      <SaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cream={creamData}
        teamMembers={teamMembers}
        onSubmit={handleCreateSale}
      />
    </Box>
  );
}