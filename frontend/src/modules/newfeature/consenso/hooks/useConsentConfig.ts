"use client";

import { useState, useEffect } from 'react';
import { consensoService } from '../service/consenso.service';

export function useConsentConfig() {
  const [loading, setLoading] = useState(true);
  const [showConsensi, setShowConsensi] = useState(false);
  const [showPosizionamento, setShowPosizionamento] = useState(false);

  useEffect(() => {
    let active = true;
    const loadConfig = async () => {
      try {
        const res = await consensoService.getConfig();
        if (active) {
          setShowConsensi(res.success ? res.showConsensi : false);
          setShowPosizionamento(res.success ? res.showPosizionamento : false);
        }
      } catch {
        if (active) {
          setShowConsensi(false);
          setShowPosizionamento(false);
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

  return { loading, showConsensi, showPosizionamento };
}
