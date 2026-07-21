'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';

export type ThemeMode = 'light' | 'dark' | 'system';

const DEFAULT_THEME: ThemeMode = 'system';

interface ThemeModeContextType {
  themeMode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  isLoading: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nagma_theme_mode');
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved as ThemeMode;
      }
    }
    return DEFAULT_THEME;
  });
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [isLoading, setIsLoading] = useState(true);
  // Usa il context direttamente (null-safe) perché ThemeModeProvider
  // può essere montato sopra AuthProvider nell'albero dei provider.
  const authCtx = useContext(AuthContext);
  const isAuthenticated = authCtx?.isAuthenticated ?? false;
  const user = authCtx?.user ?? null;

  // Resolve theme on mount and when themeMode changes
  useEffect(() => {
    const resolved = resolveTheme(themeMode);
    setResolvedTheme(resolved);

    // Apply to document for SSR hydration
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolved);
    }
  }, [themeMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', resolved);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolved);
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeMode]);

  // Load theme from backend when authenticated
  const loadThemeFromBackend = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const response: any = await apiClient.get(ENDPOINTS.AUTH.ME);
      if (response.data?.theme) {
        const backendTheme = response.data.theme.toLowerCase() as ThemeMode;
        if (['light', 'dark', 'system'].includes(backendTheme)) {
          setThemeModeState(backendTheme);
          if (typeof window !== 'undefined') {
            localStorage.setItem('nagma_theme_mode', backendTheme);
          }
        }
      }
    } catch {
      // Ignore errors, use local storage
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Save theme to backend when authenticated
  const saveThemeToBackend = useCallback(async (mode: ThemeMode) => {
    if (!isAuthenticated) return;
    try {
      await apiClient.put(ENDPOINTS.AUTH.THEME, { theme: mode.toUpperCase() });
    } catch {
      // Ignore errors, local storage is source of truth
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadThemeFromBackend();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadThemeFromBackend]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nagma_theme_mode', mode);
    }
    await saveThemeToBackend(mode);
  }, [saveThemeToBackend]);

  const value = useMemo(() => ({
    themeMode,
    resolvedTheme,
    isLoading,
    setThemeMode,
  }), [themeMode, resolvedTheme, isLoading, setThemeMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode deve essere usato all\'interno di ThemeModeProvider');
  }
  return context;
}

export default ThemeModeContext;