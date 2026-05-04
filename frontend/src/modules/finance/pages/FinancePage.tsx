"use client";

import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import Button from '@/components/ui/Button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  DollarSign,
  Download,
  Plus,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';

import PageHeader from '@/components/common/PageHeader';
import ExportModal from '@/components/modals/ExportModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import TransactionModal from '@/modules/spese/components/modals/TransactionModal';
import { formatPrice } from '@/shared/utils/format';
import { financeApi, Transaction } from '../api/finance.api';
import FinanceDataTable from '../components/FinanceDataTable';
import FinanceFilters from '../components/FinanceFilters';
import { useFinance } from '../hooks/useFinance';


export default function FinancePage() {
  const {
    transactions,
    summary,
    isLoading,
    month,
    setMonth,
    search,
    setSearch,
    type,
    setType,
    refresh
  } = useFinance();

  const { deleteItem, confirmDialogProps } = useDeleteConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleDelete = async (id: number) => {
    await deleteItem({
      confirmMessage: 'Sei sicuro di voler eliminare questa transazione? L\'operazione verrà registrata nell\'audit log.',
      action: async () => {
        await financeApi.delete(id);
        refresh();
      },
      successMessage: 'Transazione eliminata correttamente',
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };


  const exportColumns = [
    { label: 'Data', value: (t: Transaction) => format(new Date(t.date), 'dd/MM/yyyy') },
    { label: 'Tipo', value: (t: Transaction) => t.type === 'INCOME' ? 'Entrata' : 'Uscita' },
    { label: 'Categoria', value: (t: Transaction) => t.category },
    { label: 'Descrizione', value: (t: Transaction) => t.description },
    { label: 'Importo', value: (t: Transaction) => formatPrice(t.amount) },
  ];

  return (
    <Container maxWidth="xl" sx={{ pt: 1, pb: 4 }}>
      <PageHeader
        title="Storico Movimenti"
        subtitle="Cronologia completa di entrate e uscite dello studio"
        icon={<DollarSign size={24} />}
        actions={
          <Stack sx={{ flexDirection: 'row', gap: 2 }} component="div">
            <ExportModal
              filenameBase={`finanza_${format(month, 'yyyy_MM')}`}
              title={`Esportazione Finanziaria - ${format(month, 'MMMM yyyy', { locale: it })}`}
              rows={transactions}
              columns={exportColumns}
              resolveRows={async () => {
                const res = await financeApi.getAll({ 
                  month: format(month, 'yyyy-MM'), 
                  type: type === 'ALL' ? undefined : type,
                  search,
                  limit: 1000 // Prendi tutto per l'export
                });
                return res.data;
              }}
            />
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={() => {
                setSelectedTransaction(null);
                setIsModalOpen(true);
              }}
            >
              Nuovo Movimento
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            title="Entrate Totali"
            amount={summary?.totalIncome ?? 0}
            icon={<TrendingUp size={24} />}
            color="primary.main"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            title="Uscite Totali"
            amount={summary?.totalExpense ?? 0}
            icon={<TrendingDown size={24} />}
            color="error.main"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            title="Bilancio Netto"
            amount={summary?.balance ?? 0}
            icon={<DollarSign size={24} />}
            color={ (summary?.balance ?? 0) >= 0 ? 'success.main' : 'warning.main' }
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      <Stack sx={{ gap: 3 }}>
        <FinanceFilters
          month={month}
          onMonthChange={setMonth}
          search={search}
          onSearchChange={setSearch}
          type={type}
          onTypeChange={setType}
        />
        <FinanceDataTable
          data={transactions}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Stack>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refresh}
        transaction={selectedTransaction}
      />

      <ConfirmDialog {...confirmDialogProps} />
    </Container>
  );
}

function SummaryCard({ title, amount, icon, color, isLoading }: {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
}) {

  const theme = useTheme();
  return (
    <Card sx={{
      borderRadius: 3,
      border: `1px solid ${color}20`,
      background: `linear-gradient(135deg, ${color}08 0%, transparent 100%)`
    }}>
      <CardContent>
        <Stack sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: amount < 0 ? theme.palette.error.main : 'text.primary' }}>
              {isLoading ? '...' : formatPrice(amount)}
            </Typography>
          </Box>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${color}15`,
            color: color
          }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}




