'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Package, Plus } from 'lucide-react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import DataTable from '@/components/data-display/DataTable';
import PageHeader from '@/components/common/PageHeader';
import SmartFilters from '@/components/common/SmartFilters';
import { useToast } from '@/hooks/useToast';
import { creamService, type CreamSale } from '@/modules/creams/api/cream.api';
import { teamApi } from '@/modules/team/api/team.api';
import SaleModal from '../components/modals/SaleModal';
import { useCreamColumns } from '../hooks/useCreamColumns';

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

  const [creamData, setCreamData] = useState<CreamInfo | null>(null);
  const [salesData, setSalesData] = useState<{
    data: CreamSale[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [salesLoading, setSalesLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<StaffMember[]>([]);

  const filters = useMemo(() => ({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    artistId: artistFilter || undefined,
  }), [startDate, endDate, artistFilter]);

  const fetchActiveCream = useCallback(async () => {
    try {
      const data = await creamService.getActive();
      setCreamData(data);
    } catch (err) {
      console.error('Error fetching active cream:', err);
    }
  }, []);

  const fetchSales = useCallback(async () => {
    if (!creamData) return;
    setSalesLoading(true);
    try {
      const data = await creamService.getSales(creamData.id, page, 20, filters);
      setSalesData(data);
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setSalesLoading(false);
    }
  }, [creamData, page, filters]);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await teamApi.getMembers({ limit: 100 });
      setTeamMembers(res.data as unknown as StaffMember[]);
    } catch (err) {
      console.error('Error fetching team:', err);
    }
  }, []);

  useEffect(() => {
    fetchActiveCream();
    fetchTeam();
  }, [fetchActiveCream, fetchTeam]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const columns = useCreamColumns();
  const hasFilters = startDate || endDate || artistFilter;

  const handleCreateSale = async (artistId: number, quantity: number) => {
    if (!creamData) return;
    try {
      await creamService.createSale({ creamId: creamData.id, artistId, quantity });
      toast.success('Vendita registrata!');
      fetchSales();
    } catch {
      toast.error('Errore nella registrazione');
    }
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Vendite Crema Tattoo"
        filters={
          <SmartFilters
            dateRange={{
              start: { value: startDate, onChange: setStartDate },
              end: { value: endDate, onChange: setEndDate },
            }}
            select={{
              label: "Artista",
              value: artistFilter.toString(),
              onChange: (value) => setArtistFilter(value === '' ? '' : Number(value)),
              placeholder: "Tutti gli artisti",
              options: (teamMembers ?? []).map((member) => ({
                label: `${member.name} (${member.type === 'APPRENDISTA' ? 'Appr.' : 'Coll.'})`,
                value: member.id.toString(),
              })),
            }}
            submitAction={{
              label: "Filtra",
              onClick: () => setPage(1),
            }}
          />
        }
        showButton
        buttonLabel="Nuova Vendita"
        buttonIcon={<Plus size={18} />}
        onButtonClick={() => setIsModalOpen(true)}
      />

      {creamData && (
        <Box
          sx={{
            px: 2,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: 'rgba(26, 35, 50, 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: `${theme.palette.primary.main}1a`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: theme.palette.primary.main,
            }}
          >
            <Package size={18} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box component="h2" sx={{ fontSize: '0.9375rem', fontWeight: 600, color: theme.palette.text.primary, lineHeight: 1.2, m: 0 }}>
              {creamData.name}
            </Box>
            {creamData.description && (
              <Box sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {creamData.description}
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, flexShrink: 0 }}>
            <Box sx={{ fontSize: '1.125rem', fontWeight: 700, color: theme.palette.primary.main, lineHeight: 1 }}>
              {salesData?.total ?? 0}
            </Box>
            <Box sx={{ fontSize: '0.6875rem', color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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