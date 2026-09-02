"use client";

import { useState, useCallback } from 'react';

export function useModalState<T = unknown>(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [item, setItem] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setItem(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((targetItem: T) => {
    setItem(targetItem);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setItem(null);
  }, []);

  return {
    isOpen,
    item,
    openCreate,
    openEdit,
    close,
    setIsOpen,
    setItem,
  };
}
