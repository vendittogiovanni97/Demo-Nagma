import { artistRevenueQuerySchema } from '../../../src/modules/reports/controllers/reports.schemas';
import { validate } from '../../../src/core/shared/utils/validation';
import { AppError } from '../../../src/core/shared/errors/AppError';

describe('artistRevenueQuerySchema', () => {
  it('converte anno e mese dalla query string', () => {
    expect(validate(artistRevenueQuerySchema, { mode: 'month', year: '2026', month: '10' }))
      .toEqual({ mode: 'month', year: 2026, month: 10 });
  });

  it.each([
    [{ mode: 'day', day: 'abc' }],
    [{ mode: 'month', month: '13' }],
    [{ mode: 'week' }],
    [{ mode: 'custom', startDate: '2026-10-10' }],
    [{ mode: 'custom', startDate: '2026-10-10', endDate: '2026-10-01' }],
  ])('rifiuta parametri non validi con 400: %j', (query) => {
    expect(() => validate(artistRevenueQuerySchema, query)).toThrow(AppError);
  });
});
