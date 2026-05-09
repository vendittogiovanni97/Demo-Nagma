"use client";

import React from 'react';
import { Container, Box } from '@mui/material';
import ConsentForm from '../components/ConsentForm';

interface ConsentPageProps {
  bookingId: number;
}

export default function ConsentPage({ bookingId }: ConsentPageProps) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 2 }}>
        <ConsentForm bookingId={bookingId} />
      </Box>
    </Container>
  );
}
