"use client";

import { Toaster } from 'react-hot-toast';

export function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        // Hardcoded: Toaster accepts plain style objects outside React/MUI context,
        // so theme tokens are not available here.
        style: {
          background: '#111827',
          color: '#f9fafb',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }}
    />
  );
}
