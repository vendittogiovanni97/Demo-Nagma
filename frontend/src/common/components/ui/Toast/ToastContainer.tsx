"use client";

import { Toaster } from 'react-hot-toast';

export function ToastContainer() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3500,
        style: {
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: '#ffffff',
          borderRadius: '14px',
          padding: '12px 18px',
          fontFamily: '"Outfit", "Avenir Next", sans-serif',
          fontSize: '0.875rem',
          fontWeight: 600,
          border: '1px solid rgba(0, 191, 255, 0.25)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 191, 255, 0.15)',
        },
        success: {
          style: {
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '12px 18px',
            fontFamily: '"Outfit", "Avenir Next", sans-serif',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.2)',
          },
          iconTheme: {
            primary: '#10b981',
            secondary: '#0f172a',
          },
        },
        error: {
          duration: 4500,
          style: {
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '12px 18px',
            fontFamily: '"Outfit", "Avenir Next", sans-serif',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: '1px solid rgba(239, 68, 68, 0.35)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 68, 68, 0.2)',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#0f172a',
          },
        },
        loading: {
          style: {
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '12px 18px',
            fontFamily: '"Outfit", "Avenir Next", sans-serif',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: '1px solid rgba(0, 191, 255, 0.35)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 191, 255, 0.2)',
          },
          iconTheme: {
            primary: '#00bfff',
            secondary: '#0f172a',
          },
        },
      }}
    />
  );
}
