'use client';

import { usePaginationFilters } from '@/common/hooks/usePaginationFilters';
import { Box } from '@mui/material';
import Icon from '@/common/components/ui/Icon';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PageHeader from '@/common/components/common/PageHeader';
import DataTable from '@/common/components/data-display/DataTable';
import { useToast } from '@/common/hooks/useToast';
import { creamService, type CreamSale } from '@/modules/creams/api/cream.api';
import { staffApi } from '@/modules/staff/api/staff.api';
import CreamFilters from '../components/CreamFilters';
import CreamInfoBanner from '../components/CreamInfoBanner';
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
  const toast = useToast();
  const {
    page,
    setPage,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = usePaginationFilters();
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
      const res = await staffApi.getMembers({ limit: 100 });
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
          <CreamFilters
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            artistFilter={artistFilter}
            onArtistFilterChange={setArtistFilter}
            teamMembers={teamMembers}
            onFilterSubmit={() => setPage(1)}
          />
        }
        showButton
        buttonLabel="Nuova Vendita"
        buttonIcon={<Icon name="plus" size={18} />}
        onButtonClick={() => setIsModalOpen(true)}
      />

      {creamData && (
        <CreamInfoBanner
          creamData={creamData}
          salesCount={salesData?.total ?? 0}
        />
      )}

      <Box sx={{ flex: 1 }}>
        <DataTable
          data={salesData?.data ?? []}
          columns={columns}
          isLoading={salesLoading}
          emptyTitle={hasFilters ? "Nessuna vendita trovata." : "Nessuna vendita registrata."}
          emptyDescription={hasFilters ? "Prova a cambiare i filtri impostati." : "Clicca su \"Nuova Vendita\" per registrare la prima transazione."}
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
