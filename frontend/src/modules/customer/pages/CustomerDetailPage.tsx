"use client";

import { useParams } from 'next/navigation';
import CustomerDetail from '../components/CustomerDetail';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <CustomerDetail id={Number(id)} />;
}
