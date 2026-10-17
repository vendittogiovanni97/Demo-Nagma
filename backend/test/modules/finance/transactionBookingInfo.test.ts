jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: {},
}));

import { studioPercentageOf, withBookingInfo } from '../../../src/modules/finance/services/transactionService';

describe('studioPercentageOf', () => {
  it('restituisce il complemento della quota artista', () => {
    expect(studioPercentageOf({ percentualeMode: '20' })).toBe(80);
    expect(studioPercentageOf({ percentualeMode: '70' })).toBe(30);
  });

  it('per l\'affittuario (quota artista 100) la quota studio è 0', () => {
    expect(studioPercentageOf({ percentualeMode: '100' })).toBe(0);
  });

  it('legge la vecchia chiave artistPercentage', () => {
    expect(studioPercentageOf({ artistPercentage: '60' })).toBe(40);
  });

  it('restituisce null senza dati o con valori non numerici', () => {
    expect(studioPercentageOf({})).toBeNull();
    expect(studioPercentageOf(null)).toBeNull();
    expect(studioPercentageOf({ percentualeMode: 'custom' })).toBeNull();
  });
});

describe('withBookingInfo', () => {
  const bookings = new Map([
    [10, { artistName: 'Boston', notes: 'Cliente preferisce pomeriggio', formData: { percentualeMode: '20' } }],
  ]);

  it('arricchisce i movimenti legati a una prenotazione', () => {
    const [row] = withBookingInfo(
      [{ amount: '800.00', sourceId: 10, sourceType: 'BOOKING' }],
      bookings,
    );
    expect(row).toMatchObject({
      amount: 800,
      artistName: 'Boston',
      studioPercentage: 80,
      bookingNotes: 'Cliente preferisce pomeriggio',
    });
  });

  it('lascia vuoti i campi per spese e entrate libere', () => {
    const [row] = withBookingInfo(
      [{ amount: '42', sourceId: 10, sourceType: 'SPESA_LIBERA' }],
      bookings,
    );
    expect(row).toMatchObject({ artistName: null, studioPercentage: null, bookingNotes: null });
  });

  it('gestisce un acconto di prenotazione già rimossa', () => {
    const [row] = withBookingInfo(
      [{ amount: '200', sourceId: 99, sourceType: 'BOOKING_DEPOSIT' }],
      bookings,
    );
    expect(row).toMatchObject({ artistName: null, studioPercentage: null });
  });
});
