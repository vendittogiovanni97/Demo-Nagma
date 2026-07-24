"use client";

import SmartModal from '@/common/components/common/SmartModal';
import CustomerDetail from '../CustomerDetail';

interface CustomerDetailModalProps {
  id: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerDetailModal({ id, isOpen, onClose }: CustomerDetailModalProps) {
  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title="Scheda Cliente"
      maxWidth="lg"
      showFooter={false}
    >
      {id != null && <CustomerDetail id={id} embedded onClose={onClose} />}
    </SmartModal>
  );
}
