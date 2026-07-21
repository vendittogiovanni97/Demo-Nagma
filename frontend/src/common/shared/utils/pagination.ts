export function getPreferredItemsPerPage(): number {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('nagma_items_per_page');
    if (saved) {
      const num = parseInt(saved, 10);
      if ([10, 25, 50, 100].includes(num)) return num;
    }
  }
  return 25;
}
