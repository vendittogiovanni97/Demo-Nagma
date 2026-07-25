'use client';

import { useDateRangeFilters } from '@/common/hooks/useDateRangeFilters';
import { Box } from '@mui/material';
import Icon from '@/common/components/ui/Icon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import PageHeader from '@/common/components/common/PageHeader';
import DataTable, { FetchParams } from '@/common/components/table/DataTable';
import { useToast } from '@/common/hooks/useToast';
import { creamService, type CreamSale } from '@/modules/creams/api/cream.api';
import { staffApi } from '@/modules/staff/api/staff.api';
import CreamFilters from '../components/CreamFilters';
import CreamInfoBanner from '../components/CreamInfoBanner';
import SaleModal from '../components/modals/SaleModal';
import { useCreamColumns } from '../hooks/useCreamColumns';

import type { StaffType } from '@/common/shared/types/enums';

interface StaffMember {
  id: number;
  name: string;
  type: StaffType;
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
  } = useDateRangeFilters();
  const [artistFilter, setArtistFilter] = useState<number | ''>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [salesCount, setSalesCount] = useState(0);

  const [creamData, setCreamData] = useState<CreamInfo | null>(null);
  const [teamMembers, setTeamMembers] = useState<StaffMember[]>([]);

  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: it });
  const monthStart = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), 'yyyy-MM-dd');
  const monthEnd = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), 'yyyy-MM-dd');
  const prevMonth = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

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
      setIsSaleModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch {
      toast.error('Errore nella registrazione');
      throw new Error('Errore nella registrazione');
    }
  };

  const handleDeleteSale = async (sale: CreamSale) => {
    await creamService.deleteSale(sale.id);
    toast.success('Vendita eliminata.');
    setRefreshTrigger((prev) => prev + 1);
  };

  const hasCustomRange = Boolean(startDate || endDate);

  const fetchSales = useCallback(async (params: FetchParams) => {
    if (!creamData) return { data: [], total: 0 };
    const period = hasCustomRange
      ? { startDate: startDate || undefined, endDate: endDate || undefined }
      : { startDate: monthStart, endDate: monthEnd };
    const res = await creamService.getSales(creamData.id, params.page, params.limit, {
      ...period,
      artistId: artistFilter || undefined,
    });
    setSalesCount(res.totalQuantity ?? 0);
    return res;
  }, [creamData, hasCustomRange, startDate, endDate, monthStart, monthEnd, artistFilter]);

  const refreshKey = useMemo(() => {
    const period = hasCustomRange ? `${startDate || ''}_${endDate || ''}` : `${monthStart}_${monthEnd}`;
    return `${creamData?.id || ''}_${period}_${artistFilter || ''}_${refreshTrigger}`;
  }, [creamData, hasCustomRange, startDate, endDate, monthStart, monthEnd, artistFilter, refreshTrigger]);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Vendite Crema Tattoo"
        filters={
          <CreamFilters
            monthLabel={monthLabel}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
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
        onButtonClick={() => setIsSaleModalOpen(true)}
      />

      {creamData && (
        <CreamInfoBanner
          creamData={creamData}
          salesCount={salesCount}
        />
      )}

      <Box sx={{ flex: 1 }}>
        <DataTable
          fetchData={fetchSales}
          queryKey="creamSales"
          refreshKey={refreshKey}
          columns={columns}
          emptyTitle={hasFilters ? "Nessuna vendita trovata." : "Nessuna vendita registrata."}
          emptyDescription={hasFilters ? "Prova a cambiare i filtri impostati." : "Clicca su \"Nuova Vendita\" per registrare la prima transazione."}
          keyExtractor={(row) => row.id}
          hideState
          onDelete={handleDeleteSale}
          deleteConfirmTitle="Elimina vendita"
          deleteConfirmMessage="Vuoi eliminare questa vendita di crema?"
        />
      </Box>

      <SaleModal
        isOpen={isSaleModalOpen}
        cream={creamData}
        teamMembers={teamMembers}
        onClose={() => setIsSaleModalOpen(false)}
        onSubmit={handleCreateSale}
      />
    </Box>
  );
}
