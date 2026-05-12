"use client";

import { useState, useEffect } from 'react';
import { consensoService } from '../service/consenso.service';

export function useConsentConfig() {
  const [loading, setLoading] = useState(true);
  const [SHOW_CONSENSI, setSHOW_CONSENSI] = useState(false);
  const [SHOW_POSIZIONAMENTO, setSHOW_POSIZIONAMENTO] = useState(false);

  useEffect(() => {
    let active = true;
    const loadConfig = async () => {
      try {
        const res = await consensoService.getConfig();
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
    };

    loadConfig();

    return () => {
      active = false;
    };
  }, []);

  return { loading, SHOW_CONSENSI, SHOW_POSIZIONAMENTO };
}
