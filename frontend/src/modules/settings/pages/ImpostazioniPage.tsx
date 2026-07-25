"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import PageHeader from '@/common/components/common/PageHeader';
import { useAuth } from '@/common/context/AuthContext';
import ChangePasswordCard from '../components/ChangePasswordCard';
import TattooStyleCard from '../components/TattooStyleCard';

export default function ImpostazioniPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%', pt: 1 }}>
      <PageHeader title="Impostazioni" />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
          alignItems: 'start',
          maxWidth: 1100,
        }}
      >
        <ChangePasswordCard />
        <TattooStyleCard />
      </Box>
    </Box>
  );
}
