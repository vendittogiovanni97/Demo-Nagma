import { Suspense } from 'react';
import PrenotazioniPage from '@/features/prenotazioni/PrenotazioniPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PrenotazioniPage />
    </Suspense>
  );
}
