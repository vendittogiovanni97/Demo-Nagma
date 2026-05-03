import { useState, useEffect, useCallback } from 'react';
import { formTemplateService } from '@/modules/form-templates/api/form-template.api';
import type { FormTemplate } from '@/modules/form-templates/model/form-template.types';

interface UseFormTemplatesOptions {
  startDate?: string;
  endDate?: string;
}

export function useFormTemplates(options?: UseFormTemplatesOptions) {
  const { startDate, endDate } = options ?? {};
  const [data, setData] = useState<FormTemplate[] | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await formTemplateService.getAll(startDate, endDate);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, mutate: fetchData };
}