"use client";

import { useState } from 'react';

export interface TemplateFilters {
  templateSearch: string;
  startDate: string;
  endDate: string;
  setTemplateSearch: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  resetDates: () => void;
}

export function useTemplateFilters(): TemplateFilters {
  const [templateSearch, setTemplateSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetDates = () => {
    setStartDate('');
    setEndDate('');
  };

  return {
    templateSearch,
    startDate,
    endDate,
    setTemplateSearch,
    setStartDate,
    setEndDate,
    resetDates,
  };
}
