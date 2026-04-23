import useSWR from 'swr';
import { formTemplateService } from '@/services/form-template.service';
import type { FormTemplate } from '@/types/form-template';

interface UseFormTemplatesOptions {
  startDate?: string;
  endDate?: string;
}

export function useFormTemplates(options?: UseFormTemplatesOptions) {
  const { startDate, endDate } = options ?? {};
  return useSWR<FormTemplate[]>(
    startDate || endDate ? ['form-templates', startDate, endDate] : 'form-templates',
    () => formTemplateService.getAll(startDate, endDate),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );
}