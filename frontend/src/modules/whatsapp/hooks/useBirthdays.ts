'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useCallback } from 'react';
import { whatsappApi } from '../api/whatsapp.api';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import type { BirthdayCustomer } from '../model/whatsapp.types';
import { useToast } from '@/common/hooks/useToast';

export const TODAY_BIRTHDAYS_KEY = 'whatsapp-today-birthdays';

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : 'Errore invio auguri');

export function useBirthdays() {
  const toast = useToast();

  const { data, error, isLoading, mutate } = useSWR(
    TODAY_BIRTHDAYS_KEY,
    () => whatsappApi.getTodayBirthdays(),
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  const { trigger: triggerSendOne, isMutating: isSendingOne } = useSWRMutation(
    ENDPOINTS.WHATSAPP.BIRTHDAYS_SEND,
    (_key: string, { arg }: { arg: BirthdayCustomer }) => whatsappApi.sendBirthdayGreeting(arg.id, arg.alreadySentToday),
  );
  const { trigger: triggerSendAll, isMutating: isSendingAll } = useSWRMutation(
    `${ENDPOINTS.WHATSAPP.BIRTHDAYS_SEND}#all`,
    () => whatsappApi.sendAllBirthdayGreetings(),
  );

  const sendGreeting = useCallback(
    async (customer: BirthdayCustomer) => {
      try {
        const res = await triggerSendOne(customer);
        const name = `${customer.firstName} ${customer.lastName}`;
        // Con WhatsApp collegato il messaggio è già partito: riaprire wa.me farebbe
        // arrivare al cliente un secondo messaggio inviato a mano.
        if (res.sentVia === 'link' && res.whatsappUrl) {
          window.open(res.whatsappUrl, '_blank', 'noopener,noreferrer');
          toast.success(`Messaggio pronto per ${name}: invialo da WhatsApp`);
        } else {
          toast.success(`Auguri inviati a ${name}`);
        }
        await mutate();
      } catch (err: unknown) {
        toast.error(errorMessage(err));
      }
    },
    [triggerSendOne, toast, mutate]
  );

  const sendAll = useCallback(async () => {
    try {
      const res = await triggerSendAll();
      if (res.failedCount > 0) {
        toast.error(`Auguri inviati: ${res.sentCount}, non riusciti: ${res.failedCount}`);
      } else {
        toast.success(`Auguri inviati: ${res.sentCount}`);
      }
      await mutate();
    } catch (err: unknown) {
      toast.error(errorMessage(err));
    }
  }, [triggerSendAll, toast, mutate]);

  const birthdays = data?.data ?? [];

  return {
    birthdays,
    count: birthdays.length,
    unsentCount: birthdays.filter((c) => !c.alreadySentToday).length,
    templateConfigured: data?.templateConfigured ?? true,
    isLoading,
    isSending: isSendingOne || isSendingAll,
    error,
    sendGreeting,
    sendAll,
    refresh: mutate,
  };
}
