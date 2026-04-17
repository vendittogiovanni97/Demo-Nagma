"use client";

import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-[2005] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-[#0a0a0a] border border-surface-border rounded-2xl w-full ${maxWidth} shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300`}>
        <div className="p-8 border-b border-surface-border flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-2xl font-outfit text-white font-semibold">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X size={24} className="text-text-secondary" />}
            className="p-2"
          />
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
