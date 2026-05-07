'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Box } from '@mui/material';

import DataTable from '@/components/data-display/DataTable';
import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/hooks/useToast';
import { creamService, type CreamSale } from '@/modules/creams/api/cream.api';
import { staffApi } from '@/modules/staff/api/staff.api';
import SaleModal from '../components/modals/SaleModal';
import CreamInfoBanner from '../components/CreamInfoBanner';
import CreamFilters from '../components/CreamFilters';
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
        buttonIcon={<Plus size={18} />}
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