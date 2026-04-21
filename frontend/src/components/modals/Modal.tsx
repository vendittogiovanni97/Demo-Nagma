"use client";

import Button from '@/components/ui/Button';
import { X } from 'lucide-react';
import { useEffect } from 'react';

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
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-2005 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={[
          'w-full relative flex flex-col',
          maxWidth,
          'bg-[#0a1a26]/95 backdrop-blur-xl',
          'border border-white/8',
          'rounded-2xl overflow-hidden',
          'shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(0,191,255,0.08)]',
          'animate-in fade-in zoom-in-95 duration-200',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/6">
          <h3 className="text-lg font-outfit font-semibold text-white tracking-wide">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X size={18} className="text-text-secondary" />}
            className="p-1.5 hover:bg-white/10 rounded-lg"
          />
        </div>

        {/* Body */}
        <div className="p-7 overflow-y-auto max-h-[80vh] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
