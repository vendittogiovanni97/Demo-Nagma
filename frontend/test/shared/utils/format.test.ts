import { formatPrice, formatDuration, formatDate } from '@/common/shared/utils/format';

describe('formatPrice', () => {
  it('should format price with euro symbol and Italian locale', () => {
    expect(formatPrice(100)).toBe('€ 100,00');
    expect(formatPrice(99.9)).toBe('€ 99,90');
    expect(formatPrice(0)).toBe('€ 0,00');
  });

  it('should respect decimals parameter', () => {
    expect(formatPrice(100, 0)).toBe('€ 100');
    expect(formatPrice(100, 3)).toBe('€ 100,000');
  });

  it('should format large numbers', () => {
    const result = formatPrice(1500);
    expect(result).toMatch(/^€ /);
    expect(result).toContain('1500');
  });
});

describe('formatDuration', () => {
  it('should return only minutes when < 60', () => {
    expect(formatDuration(30)).toBe('30m');
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(59)).toBe('59m');
  });

  it('should return hours when exact', () => {
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(180)).toBe('3h');
  });

  it('should return hours and minutes when mixed', () => {
    expect(formatDuration(90)).toBe('1h 30m');
    expect(formatDuration(75)).toBe('1h 15m');
    expect(formatDuration(150)).toBe('2h 30m');
  });
});

describe('formatDate', () => {
  it('should format date string with default format', () => {
    const result = formatDate('2026-07-15');
    expect(result).toContain('lug');
  });

  it('should format with custom format', () => {
    const result = formatDate('2026-07-15', 'dd/MM/yyyy');
    expect(result).toBe('15/07/2026');
  });

  it('should handle Date object', () => {
    const result = formatDate(new Date(2026, 0, 1), 'yyyy');
    expect(result).toBe('2026');
  });
});
