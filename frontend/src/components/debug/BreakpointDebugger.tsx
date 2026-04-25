'use client';

import { useTheme } from '@/context/ThemeContext';

export function BreakpointDebugger() {
  const { isSmall, isMedium, isLarge, size } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-slate-900 text-white text-xs rounded-lg font-mono z-50 opacity-75">
      <div>Size: <span className="font-bold">{size}</span></div>
      <div>Small: {isSmall ? '✓' : '✗'}</div>
      <div>Medium: {isMedium ? '✓' : '✗'}</div>
      <div>Large: {isLarge ? '✓' : '✗'}</div>
    </div>
  );
}
