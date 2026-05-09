"use client";

import React, { use } from 'react';
import ConsentForm from '@/modules/newfeature/consenso/components/ConsentForm';
import { Container, Box } from '@mui/material';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PublicConsentPage({ params }: PageProps) {
  // Unwrap parameters using React 19 use() hook to stay fully compliant with Next.js 15 standards
  const resolvedParams = use(params);
  const bookingId = parseInt(resolvedParams.id, 10);

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 2 }}>
        <ConsentForm bookingId={bookingId} />
      </Box>
    </Container>
  );
}
