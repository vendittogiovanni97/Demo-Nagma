const createMockPrisma = () => ({
  $queryRaw: jest.fn(),
  customer: { findFirst: jest.fn() },
  whatsAppTemplate: { findFirst: jest.fn(), findUnique: jest.fn() },
  whatsAppMessageLog: { create: jest.fn() },
  user: { findFirst: jest.fn() },
  birthdayGreeting: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
});

jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import { Prisma } from '@prisma/client';
import prisma from '../../../src/core/shared/utils/prisma';
import {
  BirthdayReminderScheduler,
  BirthdayReminderService,
} from '../../../src/modules/whatsapp/services/birthdayReminder.service';
import { WhatsAppService, toInternationalDigits } from '../../../src/modules/whatsapp/services/whatsappService';
import type { BaileysService } from '../../../src/modules/whatsapp/services/baileys.service';
import { AppError } from '../../../src/core/shared/errors/AppError';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

// 7 ottobre 2026, ore 12:00 italiane.
const NOW = new Date('2026-10-07T10:00:00Z');

const customer = { id: 10, firstName: 'Marco', lastName: 'Rossi', phone: '3331234567', deletedAt: null };
const template = { id: 1, name: 'Auguri di Compleanno', body: 'Tanti auguri {{nome}}!', isActive: true, deletedAt: null };

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: 'test' });

describe('BirthdayReminderService', () => {
  let baileys: { isConnected: jest.Mock; sendTextMessage: jest.Mock };
  let service: BirthdayReminderService;

  beforeEach(() => {
    jest.clearAllMocks();
    baileys = { isConnected: jest.fn().mockReturnValue(true), sendTextMessage: jest.fn().mockResolvedValue(true) };
    service = new BirthdayReminderService(new WhatsAppService(), baileys as unknown as BaileysService);

    mockPrisma.customer.findFirst.mockResolvedValue(customer);
    mockPrisma.whatsAppTemplate.findFirst.mockResolvedValue(template);
    mockPrisma.whatsAppTemplate.findUnique.mockResolvedValue(template);
    mockPrisma.whatsAppMessageLog.create.mockResolvedValue({});
    mockPrisma.user.findFirst.mockResolvedValue({ id: 1 });
    mockPrisma.birthdayGreeting.create.mockResolvedValue({ id: 99 });
    mockPrisma.birthdayGreeting.update.mockResolvedValue({});
    mockPrisma.birthdayGreeting.deleteMany.mockResolvedValue({ count: 1 });
  });

  const loggedStatus = () => mockPrisma.whatsAppMessageLog.create.mock.calls.map((c) => c[0].data.status);

  describe('getTodayBirthdayCustomers', () => {
    it('segna come già inviati solo i clienti con auguri registrati quest\'anno', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ ...customer, email: null, birthDate: new Date('1995-10-07') }]);
      mockPrisma.birthdayGreeting.findMany.mockResolvedValue([{ customerId: 10, sentAt: NOW }]);

      const result = await service.getTodayBirthdayCustomers(NOW);

      expect(result[0]).toMatchObject({ id: 10, alreadySentToday: true, lastMessageSentAt: NOW });
      expect(mockPrisma.birthdayGreeting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ year: 2026, status: 'SENT' }) }),
      );
    });

    it('usa la data italiana: alle 23:30 UTC del 6 ottobre in Italia è già il 7', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await service.getTodayBirthdayCustomers(new Date('2026-10-06T23:30:00Z'));

      const [, month, day, includeLeapDay] = mockPrisma.$queryRaw.mock.calls[0];
      expect([month, day, includeLeapDay]).toEqual([10, 7, false]);
    });

    it('il 28 febbraio di un anno non bisestile include i nati il 29', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await service.getTodayBirthdayCustomers(new Date('2027-02-28T10:00:00Z'));

      expect(mockPrisma.$queryRaw.mock.calls[0][3]).toBe(true);
    });
  });

  describe('sendBirthdayGreeting', () => {
    it('con WhatsApp collegato invia davvero e registra AUTO_SENT', async () => {
      const result = await service.sendBirthdayGreeting(10, { allowLink: true, now: NOW });

      expect(baileys.sendTextMessage).toHaveBeenCalledWith('3331234567', 'Tanti auguri Marco!');
      expect(mockPrisma.birthdayGreeting.create).toHaveBeenCalledWith({ data: { customerId: 10, year: 2026 } });
      expect(mockPrisma.birthdayGreeting.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 99 }, data: expect.objectContaining({ status: 'SENT', channel: 'whatsapp' }) }),
      );
      expect(loggedStatus()).toEqual(['AUTO_SENT']);
      expect(result).toMatchObject({ sentVia: 'whatsapp', whatsappUrl: undefined });
    });

    it('se l\'invio fallisce non lo segna come inviato e libera la prenotazione per il prossimo slot', async () => {
      baileys.sendTextMessage.mockResolvedValue(false);

      await expect(service.sendBirthdayGreeting(10, { allowLink: false, now: NOW }))
        .rejects.toMatchObject({ code: 'WHATSAPP_SEND_FAILED' });

      expect(mockPrisma.birthdayGreeting.update).not.toHaveBeenCalled();
      expect(mockPrisma.birthdayGreeting.deleteMany).toHaveBeenCalledWith({ where: { id: 99, status: 'SENDING' } });
      expect(loggedStatus()).toEqual(['FAILED']);
    });

    it('senza WhatsApp collegato l\'invio automatico non registra nulla', async () => {
      baileys.isConnected.mockReturnValue(false);

      await expect(service.sendBirthdayGreeting(10, { allowLink: false, now: NOW }))
        .rejects.toMatchObject({ code: 'WHATSAPP_NOT_CONNECTED' });

      expect(mockPrisma.birthdayGreeting.create).not.toHaveBeenCalled();
      expect(mockPrisma.whatsAppMessageLog.create).not.toHaveBeenCalled();
    });

    it('senza WhatsApp collegato l\'invio manuale restituisce il link wa.me con prefisso 39', async () => {
      baileys.isConnected.mockReturnValue(false);

      const result = await service.sendBirthdayGreeting(10, { allowLink: true, now: NOW });

      expect(baileys.sendTextMessage).not.toHaveBeenCalled();
      expect(result.sentVia).toBe('link');
      expect(result.whatsappUrl).toMatch(/^https:\/\/wa\.me\/393331234567\?text=/);
      expect(loggedStatus()).toEqual(['MANUAL_SENT']);
    });

    it('non invia due volte gli auguri allo stesso cliente nello stesso anno', async () => {
      mockPrisma.birthdayGreeting.create.mockRejectedValue(uniqueViolation());
      mockPrisma.birthdayGreeting.findUnique.mockResolvedValue({ id: 99, status: 'SENT', updatedAt: NOW });

      await expect(service.sendBirthdayGreeting(10, { allowLink: true, now: NOW }))
        .rejects.toMatchObject({ code: 'BIRTHDAY_ALREADY_SENT', statusCode: 409 });

      expect(baileys.sendTextMessage).not.toHaveBeenCalled();
    });

    it('non parte se un altro processo sta già inviando', async () => {
      mockPrisma.birthdayGreeting.create.mockRejectedValue(uniqueViolation());
      mockPrisma.birthdayGreeting.findUnique.mockResolvedValue({ id: 99, status: 'SENDING', updatedAt: new Date() });

      await expect(service.sendBirthdayGreeting(10, { allowLink: true, now: NOW }))
        .rejects.toMatchObject({ code: 'BIRTHDAY_SEND_IN_PROGRESS' });
      expect(baileys.sendTextMessage).not.toHaveBeenCalled();
    });

    it('riprende una prenotazione rimasta bloccata da un processo interrotto', async () => {
      const staleAt = new Date(Date.now() - 60 * 60 * 1000);
      mockPrisma.birthdayGreeting.create.mockRejectedValue(uniqueViolation());
      mockPrisma.birthdayGreeting.findUnique.mockResolvedValue({ id: 99, status: 'SENDING', updatedAt: staleAt });
      mockPrisma.birthdayGreeting.updateMany.mockResolvedValue({ count: 1 });

      await service.sendBirthdayGreeting(10, { allowLink: false, now: NOW });

      expect(mockPrisma.birthdayGreeting.updateMany).toHaveBeenCalledWith({
        where: { id: 99, updatedAt: staleAt },
        data: { status: 'SENDING' },
      });
      expect(baileys.sendTextMessage).toHaveBeenCalledTimes(1);
    });

    it('un reinvio esplicito fallito lascia il cliente segnato come già raggiunto', async () => {
      mockPrisma.birthdayGreeting.create.mockRejectedValue(uniqueViolation());
      mockPrisma.birthdayGreeting.findUnique.mockResolvedValue({ id: 99, status: 'SENT', updatedAt: NOW });
      mockPrisma.birthdayGreeting.updateMany.mockResolvedValue({ count: 1 });
      baileys.sendTextMessage.mockResolvedValue(false);

      await expect(service.sendBirthdayGreeting(10, { allowLink: true, resend: true, now: NOW })).rejects.toBeInstanceOf(AppError);

      expect(mockPrisma.birthdayGreeting.deleteMany).not.toHaveBeenCalled();
      expect(mockPrisma.birthdayGreeting.updateMany).toHaveBeenLastCalledWith({
        where: { id: 99, status: 'SENDING' },
        data: { status: 'SENT' },
      });
    });
  });

  describe('sendAllTodayBirthdayGreetings', () => {
    it('rifiuta l\'invio a tutti se WhatsApp non è collegato', async () => {
      baileys.isConnected.mockReturnValue(false);
      await expect(service.sendAllTodayBirthdayGreetings(undefined, NOW)).rejects.toMatchObject({ code: 'WHATSAPP_NOT_CONNECTED' });
    });

    it('invia solo ai festeggiati non ancora raggiunti e conta i fallimenti', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { ...customer, id: 10, email: null, birthDate: new Date('1990-10-07') },
        { ...customer, id: 11, email: null, birthDate: new Date('1991-10-07') },
        { ...customer, id: 12, email: null, birthDate: new Date('1992-10-07') },
      ]);
      mockPrisma.birthdayGreeting.findMany.mockResolvedValue([{ customerId: 12, sentAt: NOW }]);
      baileys.sendTextMessage.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      const result = await service.sendAllTodayBirthdayGreetings(undefined, NOW);

      expect(result).toMatchObject({ processedCount: 3, sentCount: 1, failedCount: 1 });
      expect(baileys.sendTextMessage).toHaveBeenCalledTimes(2);
    });
  });
});

describe('BirthdayReminderScheduler', () => {
  const at = (iso: string) => new Date(iso);
  let reminder: { isAutoSendAvailable: jest.Mock; sendAllTodayBirthdayGreetings: jest.Mock };
  let scheduler: BirthdayReminderScheduler;

  beforeEach(() => {
    reminder = {
      isAutoSendAvailable: jest.fn().mockReturnValue(true),
      sendAllTodayBirthdayGreetings: jest.fn().mockResolvedValue({ processedCount: 0, sentCount: 0, failedCount: 0, results: [] }),
    };
    scheduler = new BirthdayReminderScheduler(reminder as unknown as BirthdayReminderService);
  });

  it('usa l\'ora italiana: alle 08:00 UTC in Italia sono le 10 e lo slot parte', async () => {
    await scheduler.checkAndRun(at('2026-10-07T08:00:00Z'));
    expect(reminder.sendAllTodayBirthdayGreetings).toHaveBeenCalledTimes(1);
  });

  it('non fa nulla prima delle 10 italiane', async () => {
    await scheduler.checkAndRun(at('2026-10-07T07:30:00Z'));
    expect(reminder.sendAllTodayBirthdayGreetings).not.toHaveBeenCalled();
  });

  it('esegue ogni slot una sola volta', async () => {
    await scheduler.checkAndRun(at('2026-10-07T08:05:00Z'));
    await scheduler.checkAndRun(at('2026-10-07T08:30:00Z'));
    await scheduler.checkAndRun(at('2026-10-07T09:05:00Z'));
    expect(reminder.sendAllTodayBirthdayGreetings).toHaveBeenCalledTimes(2);
  });

  it('senza WhatsApp collegato rimanda lo slot invece di consumarlo', async () => {
    reminder.isAutoSendAvailable.mockReturnValueOnce(false);
    await scheduler.checkAndRun(at('2026-10-07T08:05:00Z'));
    await scheduler.checkAndRun(at('2026-10-07T08:10:00Z'));
    expect(reminder.sendAllTodayBirthdayGreetings).toHaveBeenCalledTimes(1);
  });

  it('con il server avviato nel pomeriggio fa un solo recupero', async () => {
    await scheduler.checkAndRun(at('2026-10-07T13:00:00Z'));
    await scheduler.checkAndRun(at('2026-10-07T15:00:00Z'));
    expect(reminder.sendAllTodayBirthdayGreetings).toHaveBeenCalledTimes(1);
  });

  it('con la funzione WhatsApp disattivata non invia anche se la sessione è collegata', async () => {
    const disabled = new BirthdayReminderScheduler(reminder as unknown as BirthdayReminderService, async () => false);
    await disabled.checkAndRun(at('2026-10-07T08:05:00Z'));
    expect(reminder.sendAllTodayBirthdayGreetings).not.toHaveBeenCalled();
  });

  it('la sera tardi non invia più', async () => {
    await scheduler.checkAndRun(at('2026-10-07T20:00:00Z'));
    expect(reminder.sendAllTodayBirthdayGreetings).not.toHaveBeenCalled();
  });
});

describe('toInternationalDigits', () => {
  it.each([
    ['+39 333 123 4567', '393331234567'],
    ['3331234567', '393331234567'],
    ['0039 333 1234567', '393331234567'],
    ['+44 7700 900123', '447700900123'],
    ['393331234567', '393331234567'],
  ])('%s → %s', (input, expected) => {
    expect(toInternationalDigits(input)).toBe(expected);
  });

  it('rifiuta un numero senza cifre', () => {
    expect(() => toInternationalDigits('abc')).toThrow(AppError);
  });
});
