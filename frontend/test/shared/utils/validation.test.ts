import { z } from 'zod';
import { validateData } from '@/common/shared/utils/validation';

describe('validateData', () => {
  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(18, 'Must be 18+'),
  });

  it('should return null for valid data', () => {
    const result = validateData(schema, { name: 'Mario', age: 25 });
    expect(result).toBeNull();
  });

  it('should return first error message for invalid data', () => {
    const result = validateData(schema, { name: '', age: 15 });
    expect(result).toBe('Name is required');
  });

  it('should handle empty object', () => {
    const result = validateData(schema, {});
    expect(result).toMatch(/expected string/i);
  });

  it('should return fallback when schema throws', () => {
    const badSchema = { safeParse: () => { throw new Error('oops'); } } as any;
    const result = validateData(badSchema, {});
    expect(result).toBe('Dati non validi');
  });
});
