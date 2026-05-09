"use client";

import React, { use } from 'react';
import ConsentPage from '@/modules/newfeature/consenso/pages/ConsentPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PublicConsentPage({ params }: PageProps) {
  // Unwrap parameters using React 19 use() hook to stay fully compliant with Next.js 15 standards
  const resolvedParams = use(params);
  const bookingId = parseInt(resolvedParams.id, 10);

  return <ConsentPage bookingId={bookingId} />;
}
