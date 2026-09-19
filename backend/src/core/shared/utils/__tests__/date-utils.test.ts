import { buildDateFilter } from '../date-utils';

describe('buildDateFilter', () => {
  it('usa il mese quando non c\'è un intervallo', () => {
    const f = buildDateFilter('2026-07');
    expect(f).toEqual({ gte: new Date('2026-07-01T00:00:00.000Z'), lt: new Date('2026-08-01T00:00:00.000Z') });
  });

  it('usa l\'intervallo quando non c\'è il mese', () => {
    const f = buildDateFilter(undefined, '2026-07-01', '2026-07-31');
    expect(f?.gte).toEqual(new Date('2026-07-01'));
    expect(f?.lte).toEqual(new Date('2026-07-31T23:59:59.999'));
  });

  // Il difetto: mese e intervallo venivano combinati, quindi un intervallo fuori
  // dal mese selezionato produceva una lista vuota invece dei risultati attesi.
  it('ignora il mese quando è indicato un intervallo', () => {
    const f = buildDateFilter('2026-09', '2026-07-01', '2026-07-31');
    expect(f?.gte).toEqual(new Date('2026-07-01'));
    expect(f?.lte).toEqual(new Date('2026-07-31T23:59:59.999'));
    expect(f).not.toHaveProperty('lt');
  });

  it('ignora il mese anche con il solo estremo iniziale', () => {
    const f = buildDateFilter('2026-09', '2026-07-01');
    expect(f?.gte).toEqual(new Date('2026-07-01'));
    expect(f).not.toHaveProperty('lt');
  });

  it('ignora il mese anche con il solo estremo finale', () => {
    const f = buildDateFilter('2026-09', undefined, '2026-07-31');
    expect(f?.lte).toEqual(new Date('2026-07-31T23:59:59.999'));
    expect(f).not.toHaveProperty('lt');
  });

  it('non filtra nulla senza mese né intervallo', () => {
    expect(buildDateFilter()).toBeUndefined();
  });
});
