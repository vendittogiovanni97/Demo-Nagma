import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '@/common/hooks/useDebouncedValue';

jest.useFakeTimers();

describe('useDebouncedValue', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('should not update value before delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'hello' },
    });

    rerender({ value: 'world' });

    expect(result.current).toBe('hello');
  });

  it('should update value after delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'hello' },
    });

    rerender({ value: 'world' });

    act(() => { jest.advanceTimersByTime(300); });

    expect(result.current).toBe('world');
  });

  it('should cancel previous timer on rapid changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    act(() => { jest.advanceTimersByTime(100); });
    rerender({ value: 'c' });
    act(() => { jest.advanceTimersByTime(300); });

    expect(result.current).toBe('c');
  });
});
