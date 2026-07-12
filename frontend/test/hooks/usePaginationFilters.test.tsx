import { renderHook, act } from '@testing-library/react';
import { usePaginationFilters } from '@/common/hooks/usePaginationFilters';

describe('usePaginationFilters', () => {
  it('should start with default page 1', () => {
    const { result } = renderHook(() => usePaginationFilters());
    expect(result.current.page).toBe(1);
  });

  it('should start with custom initial page', () => {
    const { result } = renderHook(() => usePaginationFilters(3));
    expect(result.current.page).toBe(3);
  });

  it('should set page', () => {
    const { result } = renderHook(() => usePaginationFilters());
    act(() => result.current.setPage(5));
    expect(result.current.page).toBe(5);
  });

  it('should reset page to 1 when start date changes', () => {
    const { result } = renderHook(() => usePaginationFilters(3));
    act(() => result.current.setStartDate('2026-07-01'));
    expect(result.current.page).toBe(1);
    expect(result.current.startDate).toBe('2026-07-01');
  });

  it('should reset page to 1 when end date changes', () => {
    const { result } = renderHook(() => usePaginationFilters(3));
    act(() => result.current.setEndDate('2026-07-31'));
    expect(result.current.page).toBe(1);
    expect(result.current.endDate).toBe('2026-07-31');
  });

  it('should reset all filters', () => {
    const { result } = renderHook(() => usePaginationFilters(1));
    act(() => { result.current.setPage(5); });
    act(() => { result.current.setStartDate('2026-07-01'); });
    act(() => { result.current.setEndDate('2026-07-31'); });
    act(() => result.current.resetFilters());
    expect(result.current.page).toBe(1);
    expect(result.current.startDate).toBe('');
    expect(result.current.endDate).toBe('');
  });
});
