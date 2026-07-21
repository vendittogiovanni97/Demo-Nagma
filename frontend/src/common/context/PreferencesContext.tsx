'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userPreferencesApi, UserPreferencesData } from '@/modules/user/api/userPreferencesApi';
import { useAuth } from './AuthContext';

const DEFAULT_PREFERENCES: UserPreferencesData = {
  language: 'it',
  timezone: 'Europe/Rome',
  dateFormat: 'DD/MM/YYYY',
  itemsPerPage: 25,
  emailNotifications: true,
  inAppNotifications: true,
};

interface PreferencesContextType {
  preferences: UserPreferencesData;
  isLoading: boolean;
  updatePreferences: (data: Partial<UserPreferencesData>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferencesData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nagma_user_preferences');
      if (saved) {
        try {
          return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
        } catch {}
      }
    }
    return DEFAULT_PREFERENCES;
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadPreferences = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const remote = await userPreferencesApi.getPreferences();
      setPreferences(remote);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nagma_user_preferences', JSON.stringify(remote));
        localStorage.setItem('nagma_items_per_page', String(remote.itemsPerPage));
      }
    } catch {
      // Fallback a preferenze locali
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const handleUpdate = useCallback(async (data: Partial<UserPreferencesData>) => {
    const updated = { ...preferences, ...data };
    setPreferences(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nagma_user_preferences', JSON.stringify(updated));
      if (data.itemsPerPage) {
        localStorage.setItem('nagma_items_per_page', String(data.itemsPerPage));
      }
    }
    if (isAuthenticated) {
      await userPreferencesApi.updatePreferences(data);
    }
  }, [preferences, isAuthenticated]);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        isLoading,
        updatePreferences: handleUpdate,
        refreshPreferences: loadPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences deve essere usato all\'interno di PreferencesProvider');
  }
  return context;
}
