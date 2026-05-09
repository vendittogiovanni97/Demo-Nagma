import FinancePage from '@/modules/finance/pages/FinancePage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finanza | Nagma Portal',
  description: 'Gestione finanziaria avanzata e audit log',
};

export default function Page() {
  return <FinancePage />;
}
