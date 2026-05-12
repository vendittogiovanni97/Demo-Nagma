"use client";

import { useState, useEffect, useCallback } from 'react';
import { configService } from '@/shared/services/config.service';

export function useConsentConfig() {
  const [loading, setLoading] = useState(true);
  const [SHOW_CONSENSI, setSHOW_CONSENSI] = useState(false);
  const [SHOW_POSIZIONAMENTO, setSHOW_POSIZIONAMENTO] = useState(false);

  const loadConfig = useCallback(async (active = true) => {
    try {
      const res = await configService.getConfig();
      if (active) {
        setSHOW_CONSENSI(res.success ? res.SHOW_CONSENSI : false);
        setSHOW_POSIZIONAMENTO(res.success ? res.SHOW_POSIZIONAMENTO : false);
      }
    } catch {
      if (active) {
        setSHOW_CONSENSI(false);
        setSHOW_POSIZIONAMENTO(false);
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    loadConfig(active);

    const handleUpdate = () => {
      loadConfig(active);
    };

    window.addEventListener('consent-config-updated', handleUpdate);

    return () => {
      active = false;
      window.removeEventListener('consent-config-updated', handleUpdate);
    };
  }, [loadConfig]);

  return { loading, SHOW_CONSENSI, SHOW_POSIZIONAMENTO };
}
