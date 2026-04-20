import useSWR from 'swr';
import { formTemplateService } from '@/services/form-template.service';

export function useFormTemplates() {
  return useSWR('form-templates', () => formTemplateService.getAll(), {
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });
}
