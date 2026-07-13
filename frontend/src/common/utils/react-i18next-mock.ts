'use client';

export function useTranslation() {
  return {
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: {
      language: 'it',
      changeLanguage: async () => 'it',
    },
  };
}
