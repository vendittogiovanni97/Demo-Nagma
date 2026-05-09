"use client";

import { useState, useEffect } from 'react';
import { consensusApi } from '../api/consenso.api';

export function useConsentConfig() {
  const [loading, setLoading] = useState(true);
  const [showConsensi, setShowConsensi] = useState(false);

  useEffect(() => {
    let active = true;
    const loadConfig = async () => {
      try {
        const res = await consensusApi.getConfig();
        if (active) {
          setShowConsensi(res.success ? res.showConsensi : false);
        }
      } catch {
        if (active) {
          setShowConsensi(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      active = false;
    };
  }, []);

  return { loading, showConsensi };
}
