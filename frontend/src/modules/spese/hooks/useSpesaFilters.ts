"use client";

import { useState } from 'react';

export function useSpesaFilters() {
  const [currentDate, setCurrentDate] = useState(new Date());

  return {
    currentDate,
    setCurrentDate,
  };
}
