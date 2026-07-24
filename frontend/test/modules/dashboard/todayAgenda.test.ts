import type { BookingStatus } from '@/common/shared/types/enums';
import { getOperationalTodayBookings } from '@/modules/dashboard/utils/todayAgenda';

interface TestBooking {
  id: number;
  date: string;
  status: BookingStatus;
}

const TODAY = new Date('2026-07-22T12:00:00+02:00');

describe('getOperationalTodayBookings', () => {
  it('mantiene solo gli appuntamenti creati o confermati della giornata', () => {
    const bookings: TestBooking[] = [
      { id: 1, date: '2026-07-22T12:15:00+02:00', status: 'CONFERMATO' },
      { id: 2, date: '2026-07-22T11:55:00+02:00', status: 'CREATO' },
      { id: 3, date: '2026-07-22T12:10:00+02:00', status: 'COMPLETATO' },
      { id: 4, date: '2026-07-22T12:20:00+02:00', status: 'ANNULLATO' },
      { id: 5, date: '2026-07-22T13:00:00+02:00', status: 'CANCELLATO' },
      { id: 6, date: '2026-07-23T09:00:00+02:00', status: 'CONFERMATO' },
    ];

    expect(getOperationalTodayBookings(bookings, TODAY).map((booking) => booking.id)).toEqual([2, 1]);
  });

  it('non modifica l’array originale durante l’ordinamento', () => {
    const bookings: TestBooking[] = [
      { id: 1, date: '2026-07-22T12:30:00+02:00', status: 'CONFERMATO' },
      { id: 2, date: '2026-07-22T12:15:00+02:00', status: 'CREATO' },
    ];

    getOperationalTodayBookings(bookings, TODAY);

    expect(bookings.map((booking) => booking.id)).toEqual([1, 2]);
  });

  it('nasconde un appuntamento quando sono trascorsi più di dieci minuti', () => {
    const bookings: TestBooking[] = [
      { id: 1, date: '2026-07-22T11:49:59+02:00', status: 'CONFERMATO' },
      { id: 2, date: '2026-07-22T11:50:00+02:00', status: 'CREATO' },
      { id: 3, date: '2026-07-22T11:55:00+02:00', status: 'CONFERMATO' },
    ];

    expect(getOperationalTodayBookings(bookings, TODAY).map((booking) => booking.id)).toEqual([2, 3]);
  });
});
