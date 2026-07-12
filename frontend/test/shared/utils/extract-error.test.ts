import { extractErrorMessage } from '@/common/shared/utils/extract-error';

describe('extractErrorMessage', () => {
  it('should return Error message for Error instance', () => {
    expect(extractErrorMessage(new Error('Something went wrong'))).toBe('Something went wrong');
  });

  it('should return string as-is', () => {
    expect(extractErrorMessage('direct error string')).toBe('direct error string');
  });

  it('should return fallback for unknown types', () => {
    expect(extractErrorMessage(null)).toBe('Errore inatteso');
    expect(extractErrorMessage(undefined)).toBe('Errore inatteso');
    expect(extractErrorMessage(42)).toBe('Errore inatteso');
    expect(extractErrorMessage({})).toBe('Errore inatteso');
  });

  it('should use custom fallback', () => {
    expect(extractErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });

  it('should handle Error with empty message', () => {
    expect(extractErrorMessage(new Error())).toBe('');
  });
});
