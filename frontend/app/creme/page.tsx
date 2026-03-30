"use client";

import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import DataTable from '@/components/DataTable';
import { useState } from 'react';
import CreamModal from '@/components/CreamModal';

export default function CremePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: creams, isLoading, mutate: mutateCreams } = useSWR('/api/creams', fetcher);
  const { data: sales, isLoading: loadingSales } = useSWR('/api/creams/sales', fetcher);

  const columns = [
    { key: 'name', header: 'Nome Prodotto', render: (val: any) => <span className="font-bold">{val}</span> },
    { key: 'brand', header: 'Brand', render: (val: any) => <span className="text-text-secondary text-xs">{val || 'Generico'}</span> },
    { key: 'price', header: 'Prezzo', render: (val: any) => `€ ${val.toFixed(2)}` },
    { key: 'stock', header: 'Stock', render: (val: any) => (
      <span className={`font-bold ${val < 5 ? 'text-danger' : 'text-success'}`}>{val}</span>
    ) }
  ];

  const salesCols = [
    { key: 'soldAt', header: 'Data Vendita', render: (val: any) => new Date(val).toLocaleDateString('it-IT') },
    { key: 'cream', header: 'Prodotto', render: (val: any) => val?.name },
    { key: 'quantity', header: 'Qt.', render: (val: any) => <span className="text-accent">{val}</span> },
    { key: 'totalPrice', header: 'Incasso', render: (val: any) => `€ ${val.toFixed(2)}` }
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      <h1 className="text-3xl tracking-tight text-white font-outfit font-semibold">Inventario e Shop</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Inventario */}
        <div className="glass-panel p-6 flex flex-col gap-4 overflow-hidden">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-outfit">Prodotti (Creme)</h2>
             <button onClick={() => setIsModalOpen(true)} className="btn-primary text-sm py-2">+ Prodotto</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DataTable data={creams} columns={columns} isLoading={isLoading} emptyMessage="Nessun prodotto inventariato." />
          </div>
        </div>

        {/* Vendite */}
        <div className="glass-panel p-6 flex flex-col gap-4 overflow-hidden">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-outfit">Recenti Vendite</h2>
             <button className="glass-btn font-bold text-accent py-2 text-sm px-4 hover:border-accent">Vendi al volo</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DataTable data={sales} columns={salesCols} isLoading={loadingSales} emptyMessage="Nessuna vendita registrata." />
          </div>
        </div>
        
      </div>
      
      <CreamModal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        mutateCreams();
      }} />
    </div>
  );
}
