"use client";
import { useParams } from 'next/navigation';
import ClienteDetailPage from '@/features/clienti/ClienteDetailPage';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <ClienteDetailPage id={Number(id)} />;
}
