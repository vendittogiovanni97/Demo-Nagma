import { act, renderHook } from '@testing-library/react';
import { useDateRangeFilters } from '@/common/hooks/useDateRangeFilters';

describe('useDateRangeFilters', () => {
  it('gestisce e resetta l’intervallo date', () => {
    const { result } = renderHook(() => useDateRangeFilters());

    act(() => result.current.setStartDate('2026-07-01'));
    act(() => result.current.setEndDate('2026-07-31'));
    expect(result.current.startDate).toBe('2026-07-01');
    expect(result.current.endDate).toBe('2026-07-31');

    act(() => result.current.resetDateRange());
    expect(result.current.startDate).toBe('');
    expect(result.current.endDate).toBe('');
  });
});
