export const PAGE_SIZE_STORAGE_KEY = 'nagma_items_per_page';
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export function getPreferredItemsPerPage(): number {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
    if (saved) {
      const num = parseInt(saved, 10);
      if (PAGE_SIZE_OPTIONS.some((option) => option === num)) return num;
    }
  }
  return DEFAULT_PAGE_SIZE;
}

export function setPreferredItemsPerPage(value: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(value));
}
