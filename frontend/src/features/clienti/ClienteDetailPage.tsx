"use client";

import CustomerDetail from './components/CustomerDetail';

interface Props {
  id: number;
}

export default function ClienteDetailPage({ id }: Props) {
  return <CustomerDetail id={id} />;
}
