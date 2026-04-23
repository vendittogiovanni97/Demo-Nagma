"use client";

import dynamic from 'next/dynamic';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import PageHeader from '@/components/layout/PageHeader';
import DataTable, { type Column } from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import { creamService, type CreamSale } from '@/services/cream.service';
import { teamService } from '@/services/team.service';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Plus, Package, User, Hash, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

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
        <span className="text-sm text-white">
          {format(new Date(row.soldAt), 'dd MMM yyyy', { locale: it })}
        </span>
      ),
    },
    {
      key: 'artist',
      label: 'Artista',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full shrink-0 ring-1 ring-white/10"
            style={{ backgroundColor: row.artist.color || '#3b82f6' }}
          />
          <span className="text-white font-medium">{row.artist.name}</span>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Qtà',
      width: '80px',
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15 text-accent font-bold text-sm">
          {row.quantity}
        </span>
      ),
    },
  ];

  const totalPages = salesData?.totalPages ?? 1;

  const hasFilters = startDate || endDate || artistFilter;

  return (
    <div className="flex-1 flex flex-col gap-6">
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
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-secondary font-medium">Dal:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-secondary font-medium">Al:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value ? Number(e.target.value) : '')}
              className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
            >
              <option value="">Tutti gli artisti</option>
              {teamMembers?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.type === 'APPRENDISTA' ? 'Appr.' : 'Coll.'})
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" size="sm" onClick={handleSearch}>
            Filtra
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset} icon={<X size={14} />}>
              Reset
            </Button>
          )}
        </div>
      </PageHeader>

      {creamData && (
        <div className="glass-panel p-5 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
            <Package size={28} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-white font-outfit">{creamData.name}</h2>
            {creamData.description && (
              <p className="text-sm text-text-secondary mt-1 truncate">
                {creamData.description}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-accent font-outfit">
              {salesData?.total ?? 0}
            </div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">Vendute</div>
          </div>
        </div>
      )}

      <div className="flex-1">
        <DataTable
          data={salesData?.data ?? []}
          columns={columns}
          isLoading={salesLoading}
          emptyMessage={hasFilters ? "Nessuna vendita trovata per i filtri selezionati." : "Nessuna vendita registrata. Clicca 'Nuova Vendita' per iniziare."}
          keyExtractor={(row) => row.id}
          pageSize={7}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedArtistId(0);
          setQuantity(1);
        }}
        title="Registra Vendita"
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-surface-border">
            <Package size={20} className="text-accent" />
            <span className="text-white font-medium">{creamData?.name}</span>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <User size={14} />
              Artista
            </label>
            <select
              value={selectedArtistId}
              onChange={(e) => setSelectedArtistId(Number(e.target.value))}
              className="w-full bg-white/5 border border-surface-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
            >
              <option value={0}>Seleziona artista...</option>
              {teamMembers?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.type === 'APPRENDISTA' ? 'Apprendista' : 'Collaboratore'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <Hash size={14} />
              Quantità
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white/5 border border-surface-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent text-center font-mono text-lg"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedArtistId(0);
                setQuantity(1);
              }}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSale}
              disabled={!selectedArtistId}
              className="flex-1"
            >
              Registra
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}