'use client';

import { useState, useEffect, useCallback } from 'react';
import { savedViewApi, SavedViewData, FilterCondition } from '@/modules/saved-views/api/savedViewApi';
import { useToast } from './useToast';

export function useSavedViews(moduleName: string) {
  const toast = useToast();
  const [savedViews, setSavedViews] = useState<SavedViewData[]>([]);
  const [activeViewId, setActiveViewId] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadSavedViews = useCallback(async () => {
    try {
      setIsLoading(true);
      const views = await savedViewApi.getSavedViews(moduleName);
      setSavedViews(views);

      // Carica eventuale vista predefinita
      const defaultView = views.find((v) => v.isDefault);
      if (defaultView && !activeViewId) {
        setActiveViewId(defaultView.id);
        setActiveFilters(defaultView.filters || []);
      }
    } catch {
      // Ignora errori di caricamento non bloccanti
    } finally {
      setIsLoading(false);
    }
  }, [moduleName, activeViewId]);

  useEffect(() => {
    loadSavedViews();
  }, [loadSavedViews]);

  const handleSelectView = (view: SavedViewData | null) => {
    if (!view) {
      setActiveViewId(null);
      setActiveFilters([]);
    } else {
      setActiveViewId(view.id);
      setActiveFilters(view.filters || []);
    }
  };

  const handleSaveNewView = async (name: string, isDefault: boolean) => {
    try {
      const created = await savedViewApi.createSavedView({
        module: moduleName,
        name,
        filters: activeFilters,
        isDefault,
      });
      toast.success(`Vista "${name}" salvata con successo!`);
      setActiveViewId(created.id);
      await loadSavedViews();
    } catch (err: any) {
      toast.error(err.message || 'Errore durante il salvataggio della vista');
    }
  };

  const handleDeleteView = async (id: number) => {
    try {
      await savedViewApi.deleteSavedView(id);
      toast.success('Vista eliminata');
      if (activeViewId === id) {
        setActiveViewId(null);
        setActiveFilters([]);
      }
      await loadSavedViews();
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'eliminazione');
    }
  };

  const handleSetDefaultView = async (id: number) => {
    try {
      await savedViewApi.setDefault(id);
      toast.success('Vista impostata come predefinita');
      await loadSavedViews();
    } catch (err: any) {
      toast.error(err.message || 'Errore impostazione vista predefinita');
    }
  };

  return {
    savedViews,
    activeViewId,
    activeFilters,
    setActiveFilters,
    isFilterModalOpen,
    setIsFilterModalOpen,
    isLoading,
    handleSelectView,
    handleSaveNewView,
    handleDeleteView,
    handleSetDefaultView,
    refreshSavedViews: loadSavedViews,
  };
}
