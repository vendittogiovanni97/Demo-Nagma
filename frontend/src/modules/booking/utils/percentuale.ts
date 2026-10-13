// Nel DB `formData.percentualeMode` resta la quota ARTISTA (prenotazioni storiche,
// seed e backend la leggono così); il form mostra la quota STUDIO, che è il complemento.

const DEFAULT_STUDIO_PERCENT = '50';

const clampPercent = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

export function studioPercentFromStored(
  formData: Record<string, unknown> | null | undefined,
  price: number | string | null | undefined,
): string {
  const stored = formData?.percentualeMode ?? formData?.artistPercentage;
  if (stored == null || stored === '') return DEFAULT_STUDIO_PERCENT;

  if (stored === 'custom') {
    const artistPrice = Number(formData?.artistPrice) || 0;
    const total = Number(price) || 0;
    if (total <= 0) return '100';
    return String(100 - clampPercent((artistPrice / total) * 100));
  }

  const artistPercent = Number(stored);
  if (!Number.isFinite(artistPercent)) return DEFAULT_STUDIO_PERCENT;
  return String(100 - clampPercent(artistPercent));
}

export function artistPercentToStore(studioPercent: number | string): string {
  return String(100 - clampPercent(Number(studioPercent) || 0));
}
