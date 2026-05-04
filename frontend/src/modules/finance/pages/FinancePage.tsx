"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  DollarSign,
  Download,
  History,
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
import HistoryTable from '../components/HistoryTable';
import { useFinance, useFinanceHistory } from '../hooks/useFinance';


export default function FinancePage() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const {
    transactions,
    summary,
    isLoading,
    page,
    setPage,
    month,
    setMonth,
    search,
    setSearch,
    type,
    setType,
    refresh
  } = useFinance();

  const { deleteItem, confirmDialogProps } = useDeleteConfirm();
  const [isExportOpen, setIsExportOpen] = useState(false);
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        title="Amministrazione Finanziaria"
        subtitle="Monitoraggio entrate, uscite e audit log globale"
        actions={
          <Stack sx={{ flexDirection: 'row', gap: 2 }} component="div">
            <ExportModal
              isOpen={isExportOpen}
              onClose={() => setIsExportOpen(false)}
              title={`Esportazione Finanziaria - ${format(month, 'MMMM yyyy', { locale: it })}`}
              filenameBase={`finanza_${format(month, 'yyyy_MM')}`}
              rows={transactions}
              columns={exportColumns}
              resolveRows={async () => transactions} // For now just current page, could be improved to fetch all month
            />
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => {
                setSelectedTransaction(null);
                setIsModalOpen(true);
              }}
              sx={{ borderRadius: 2 }}
            >

              Nuovo Movimento
            </Button>
          </Stack>
        }
      />


      <Grid container spacing={3} sx={{ mb: 4, mt: 2 }}>

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


      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Transazioni" icon={<DollarSign size={18} />} iconPosition="start" />
          <Tab label="Audit Log" icon={<History size={18} />} iconPosition="start" />
        </Tabs>
      </Box>
      {tab === 0 ? (
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
      ) : (
        <FinanceHistoryView />
      )}

      {/* Reusing TransactionModal - may need props adjustment */}
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

function FinanceHistoryView() {
  const { history, isLoading, page, setPage } = useFinanceHistory();

  return (
    <Stack sx={{ gap: 3 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }} component="div">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Log delle attività finanziarie</Typography>
            <Typography variant="caption" color="text.secondary">Tutte le operazioni sono registrate in modo immutabile</Typography>
          </Stack>
          <HistoryTable data={history} isLoading={isLoading} />
        </CardContent>
      </Card>
    </Stack>
  );
}


