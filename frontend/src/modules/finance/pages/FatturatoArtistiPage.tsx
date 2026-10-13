'use client';

import type { ComponentProps } from 'react';
import Box from '@mui/material/Box';
import PageContainer from '@/common/components/layout/PageContainer';
import PageHeader from '@/common/components/common/PageHeader';
import StatePanel from '@/common/components/feedback/StatePanel';
import Icon from '@/common/components/ui/Icon';
import { useAuth } from '@/common/context/AuthContext';
import { useArtistRevenue } from '../hooks/useArtistRevenue';
import ArtistRevenueTimeFilter from '../components/ArtistRevenueTimeFilter';
import ArtistRevenueCard from '../components/ArtistRevenueCard';

const UsersIcon = (props: Omit<ComponentProps<typeof Icon>, 'name'>) => <Icon name="users" {...props} />;

export default function FatturatoArtistiPage() {
  const { isAdmin } = useAuth();
  const {
    mode,
    setMode,
    currentDate,
    setCurrentDate,
    handlePrev,
    handleNext,
    handleToday,
    artists,
    isLoading,
    error,
  } = useArtistRevenue();

  if (!isAdmin) {
    return (
      <PageContainer pt={2}>
        <PageHeader title="Fatturato per Artista" />
        <StatePanel
          variant="error"
          title="Accesso limitato"
          description="Solo gli amministratori possono visualizzare i dati finanziari e il fatturato per artista."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer pt={2}>
      <PageHeader
        title="Fatturato per Artista"
        subtitle="Riepilogo incassi, acconti e performance degli artisti su prenotazioni completate"
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1, width: '100%' }}>
        <ArtistRevenueTimeFilter
          mode={mode}
          onModeChange={setMode}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
        />

        {isLoading ? (
          <StatePanel variant="loading" title="Caricamento dati fatturato..." />
        ) : error ? (
          <StatePanel
            variant="error"
            title="Errore durante il caricamento"
            description={error instanceof Error ? error.message : 'Impossibile recuperare i dati.'}
          />
        ) : artists.length === 0 ? (
          <StatePanel
            variant="empty"
            title="Nessun artista registrato"
            description="Non risultano membri dello staff registrati nel sistema."
            icon={UsersIcon}
          />
        ) : (
          <Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                  xl: 'repeat(4, 1fr)',
                },
                gap: 2.5,
              }}
            >
              {artists.map((artist, idx) => (
                <ArtistRevenueCard
                  key={artist.id}
                  artist={artist}
                  rank={idx + 1}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
}
