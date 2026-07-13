'use client';

import { usePaginationFilters } from '@/common/hooks/usePaginationFilters';
import { Box } from '@mui/material';
import Icon from '@/common/components/ui/Icon';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

import PageHeader from '@/common/components/common/PageHeader';
import DataTable, { FetchParams, DataTableRef } from '@/common/components/data-display/DataTable';
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
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = usePaginationFilters();
  const [artistFilter, setArtistFilter] = useState<number | ''>('');
  const tableRef = useRef<DataTableRef>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [creamData, setCreamData] = useState<CreamInfo | null>(null);
  const [teamMembers, setTeamMembers] = useState<StaffMember[]>([]);

  const fetchActiveCream = useCallback(async () => {
    try {
      const data = await creamService.getActive();
      setCreamData(data);
    } catch (err) {
      console.error('Error fetching active cream:', err);
    }
  }, []);

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

  const columns = useCreamColumns();
  const hasFilters = startDate || endDate || artistFilter;

  const handleCreateSale = async (artistId: number, quantity: number) => {
    if (!creamData) return;
    try {
      await creamService.createSale({ creamId: creamData.id, artistId, quantity });
      toast.success('Vendita registrata!');
    } catch {
      toast.error('Errore nella registrazione');
      throw new Error('Errore nella registrazione');
    }
  };

  const fetchSales = useCallback(async (params: FetchParams) => {
    if (!creamData) return { data: [], total: 0 };
    const res = await creamService.getSales(creamData.id, params.page, params.limit, {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      artistId: artistFilter || undefined,
    });
    return res;
  }, [creamData, startDate, endDate, artistFilter]);

  const refreshKey = useMemo(() => {
    return `${creamData?.id || ''}_${startDate || ''}_${endDate || ''}_${artistFilter || ''}_${refreshTrigger}`;
  }, [creamData, startDate, endDate, artistFilter, refreshTrigger]);

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
            onFilterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
          />
        }
        showButton
        buttonLabel="Nuova Vendita"
        buttonIcon={<Icon name="plus" size={18} />}
        onButtonClick={() => tableRef.current?.openCreateModal()}
      />

      {creamData && (
        <CreamInfoBanner
          creamData={creamData}
          salesCount={0}
        />
      )}

      <Box sx={{ flex: 1 }}>
        <DataTable
          ref={tableRef}
          fetchData={fetchSales}
          queryKey="creamSales"
          refreshKey={refreshKey as any}
          columns={columns}
          emptyTitle={hasFilters ? "Nessuna vendita trovata." : "Nessuna vendita registrata."}
          emptyDescription={hasFilters ? "Prova a cambiare i filtri impostati." : "Clicca su \"Nuova Vendita\" per registrare la prima transazione."}
          keyExtractor={(row) => row.id}
          pageSize={7}
          openEntityModal={(action, row, onClose, onSuccess) => (
            <SaleModal
              isOpen
              cream={creamData}
              teamMembers={teamMembers}
              onClose={onClose || (() => {})}
              onSubmit={async (artistId, quantity) => {
                await handleCreateSale(artistId, quantity);
                onSuccess?.();
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
}
