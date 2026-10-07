'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { whatsappApi } from '../api/whatsapp.api';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import type { WhatsAppSessionInfo } from '../model/whatsapp.types';
import { useToast } from '@/common/hooks/useToast';

const DISCONNECTED_SESSION: WhatsAppSessionInfo = {
  status: 'DISCONNECTED',
  qrCodeDataUrl: null,
  phoneNumber: null,
  userName: null,
};

export function useWhatsAppConnection() {
  const toast = useToast();

  const { data, error, isLoading, mutate } = useSWR<WhatsAppSessionInfo>(
    ENDPOINTS.WHATSAPP.CONNECTION_STATUS,
    () => whatsappApi.getConnectionStatus(),
    {
      refreshInterval: (latestData) => (latestData?.status === 'CONNECTING' ? 2500 : 15000),
      revalidateOnFocus: true,
    }
  );

  const { trigger: triggerConnect, isMutating: isConnecting } = useSWRMutation(
    ENDPOINTS.WHATSAPP.CONNECT,
    () => whatsappApi.connect(),
  );
  const { trigger: triggerDisconnect, isMutating: isDisconnecting } = useSWRMutation(
    ENDPOINTS.WHATSAPP.DISCONNECT,
    () => whatsappApi.disconnect(),
  );

  const connect = useCallback(async () => {
    try {
      const res = await triggerConnect();
      await mutate(res, false);
      toast.success('Inizializzazione sessione WhatsApp avviata');
    } catch {
      toast.error('Errore durante la connessione di WhatsApp');
    }
  }, [triggerConnect, mutate, toast]);

  const disconnect = useCallback(async () => {
    try {
      await triggerDisconnect();
      await mutate(DISCONNECTED_SESSION, false);
      toast.success('WhatsApp disconnesso con successo');
    } catch {
      toast.error('Errore durante la disconnessione');
    }
  }, [triggerDisconnect, mutate, toast]);

  return {
    session: data,
    isLoading,
    isActionLoading: isConnecting || isDisconnecting,
    error,
    connect,
    disconnect,
    refresh: mutate,
  };
}
