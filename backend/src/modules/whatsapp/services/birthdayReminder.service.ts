import { Prisma } from '@prisma/client';
import prisma from '../../../core/shared/utils/prisma';
import { logger } from '../../../core/shared/utils/logger';
import { AppError } from '../../../core/shared/errors/AppError';
import { hourInZone, todayInZone } from '../../../core/shared/utils/date-utils';
import { WhatsAppService } from './whatsappService';
import { BaileysService } from './baileys.service';

const DEFAULT_TEMPLATE_BODY =
  'Tanti auguri di buon compleanno da Nagma Tattoo Studio, {{nome}}! 🎂🎉\n\nPer festeggiare il tuo giorno speciale ti riserviamo uno sconto esclusivo del 10% sul tuo prossimo appuntamento!\n\nTi aspettiamo in studio, a presto!';

// Una prenotazione dell'invio rimasta in SENDING oltre questa soglia viene da un
// processo interrotto a metà: si può riprendere senza rischiare un doppio invio.
const STALE_CLAIM_MS = 10 * 60 * 1000;

export interface BirthdayCustomer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  birthDate: Date;
  alreadySentToday: boolean;
  lastMessageSentAt?: Date | null;
}

export type GreetingChannel = 'whatsapp' | 'link';

export interface GreetingResult {
  customer: { id: number; name: string; phone: string };
  sentVia: GreetingChannel;
  whatsappUrl?: string;
  message: string;
}

export interface BulkGreetingResult {
  processedCount: number;
  sentCount: number;
  failedCount: number;
  results: Array<{ customerId: number; name: string; success: boolean }>;
}

type GreetingClaim = { id: number; wasSent: boolean };

const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

function todayParts(now: Date) {
  const [year, month, day] = todayInZone(undefined, now).split('-').map(Number);
  return { year, month, day };
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
}

export class BirthdayReminderService {
  constructor(
    private readonly whatsAppService: WhatsAppService,
    private readonly baileysService: BaileysService,
  ) {}

  isAutoSendAvailable(): boolean {
    return this.baileysService.isConnected();
  }

  async getTodayBirthdayCustomers(now = new Date()): Promise<BirthdayCustomer[]> {
    const { year, month, day } = todayParts(now);
    // Negli anni non bisestili chi è nato il 29 febbraio festeggia il 28.
    const includeLeapDay = month === 2 && day === 28 && !isLeapYear(year);

    const customers = await prisma.$queryRaw<Array<Omit<BirthdayCustomer, 'alreadySentToday' | 'lastMessageSentAt'>>>`
      SELECT id, "firstName", "lastName", phone, email, "birthDate"
      FROM customers
      WHERE "deletedAt" IS NULL
        AND "birthDate" IS NOT NULL
        AND (
          (EXTRACT(MONTH FROM "birthDate") = ${month} AND EXTRACT(DAY FROM "birthDate") = ${day})
          OR (${includeLeapDay} AND EXTRACT(MONTH FROM "birthDate") = 2 AND EXTRACT(DAY FROM "birthDate") = 29)
        )
      ORDER BY "lastName" ASC, "firstName" ASC
    `;
    if (!customers.length) return [];

    const greetings = await prisma.birthdayGreeting.findMany({
      where: { customerId: { in: customers.map((c) => c.id) }, year, status: 'SENT' },
      select: { customerId: true, sentAt: true },
    });
    const sentAtByCustomer = new Map(greetings.map((g) => [g.customerId, g.sentAt]));

    return customers.map((c) => ({
      ...c,
      alreadySentToday: sentAtByCustomer.has(c.id),
      lastMessageSentAt: sentAtByCustomer.get(c.id) ?? null,
    }));
  }

  /**
   * Invia gli auguri a un cliente. Con WhatsApp collegato il messaggio parte
   * davvero e viene registrato solo se l'invio riesce; senza collegamento, e solo
   * se `allowLink`, restituisce il link wa.me da aprire a mano.
   */
  async sendBirthdayGreeting(
    customerId: number,
    options: { userId?: number; allowLink: boolean; resend?: boolean; now?: Date },
  ): Promise<GreetingResult> {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, deletedAt: null } });
    if (!customer) {
      throw new AppError('Cliente non trovato', 404, 'CUSTOMER_NOT_FOUND');
    }

    const viaWhatsApp = this.baileysService.isConnected();
    if (!viaWhatsApp && !options.allowLink) {
      throw new AppError('WhatsApp non è collegato', 409, 'WHATSAPP_NOT_CONNECTED');
    }

    const { year } = todayParts(options.now ?? new Date());
    const claim = await this.claimGreeting(customer.id, year, Boolean(options.resend));
    let sent = false;

    try {
      const template = await prisma.whatsAppTemplate.findFirst({
        where: {
          deletedAt: null,
          isActive: true,
          OR: [
            { category: 'COMPLEANNO' },
            { name: { contains: 'compleanno', mode: 'insensitive' } },
            { name: { contains: 'auguri', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      const messageData = {
        recipientPhone: customer.phone,
        recipientName: `${customer.firstName} ${customer.lastName}`,
        customerId: customer.id,
        templateId: template?.id,
        message: template?.body || DEFAULT_TEMPLATE_BODY,
        variables: {
          nome: customer.firstName,
          firstName: customer.firstName,
          cognome: customer.lastName,
          lastName: customer.lastName,
        },
      };
      const prepared = await this.whatsAppService.prepareMessage(messageData);
      const userId = options.userId ?? await this.systemUserId();

      if (viaWhatsApp) {
        sent = await this.baileysService.sendTextMessage(prepared.recipientPhone, prepared.message);
        if (!sent) {
          await this.whatsAppService.logMessage(prepared, messageData, userId, 'FAILED');
          throw new AppError('Invio WhatsApp non riuscito', 502, 'WHATSAPP_SEND_FAILED');
        }
      }

      // Da qui il messaggio è considerato consegnato (o affidato all'operatore):
      // la prenotazione non va più rilasciata, anche se il log fallisse.
      sent = true;
      const channel: GreetingChannel = viaWhatsApp ? 'whatsapp' : 'link';
      await prisma.birthdayGreeting.update({
        where: { id: claim.id },
        data: { status: 'SENT', channel, sentAt: new Date() },
      });
      await this.whatsAppService.logMessage(prepared, messageData, userId, viaWhatsApp ? 'AUTO_SENT' : 'MANUAL_SENT');

      return {
        customer: { id: customer.id, name: messageData.recipientName, phone: customer.phone },
        sentVia: channel,
        whatsappUrl: viaWhatsApp ? undefined : prepared.whatsappUrl,
        message: prepared.message,
      };
    } catch (err) {
      if (!sent) await this.releaseGreeting(claim);
      throw err;
    }
  }

  /** Invio automatico a tutti i festeggiati non ancora raggiunti: richiede WhatsApp collegato. */
  async sendAllTodayBirthdayGreetings(userId?: number, now = new Date()): Promise<BulkGreetingResult> {
    if (!this.baileysService.isConnected()) {
      throw new AppError('Collega WhatsApp per inviare gli auguri automaticamente', 409, 'WHATSAPP_NOT_CONNECTED');
    }

    const todayCustomers = await this.getTodayBirthdayCustomers(now);
    const results: BulkGreetingResult['results'] = [];

    for (const customer of todayCustomers.filter((c) => !c.alreadySentToday)) {
      const name = `${customer.firstName} ${customer.lastName}`;
      try {
        await this.sendBirthdayGreeting(customer.id, { userId, allowLink: false, now });
        results.push({ customerId: customer.id, name, success: true });
      } catch (err) {
        // Già inviato da un altro processo nel frattempo: non è un errore.
        if (err instanceof AppError && err.code === 'BIRTHDAY_ALREADY_SENT') continue;
        logger.error(`[BirthdayReminder] Invio auguri fallito per cliente ${customer.id}`, {
          error: err instanceof Error ? err.message : String(err),
        });
        results.push({ customerId: customer.id, name, success: false });
      }
    }

    const sentCount = results.filter((r) => r.success).length;
    return {
      processedCount: todayCustomers.length,
      sentCount,
      failedCount: results.length - sentCount,
      results,
    };
  }

  private async claimGreeting(customerId: number, year: number, resend: boolean): Promise<GreetingClaim> {
    try {
      const created = await prisma.birthdayGreeting.create({ data: { customerId, year } });
      return { id: created.id, wasSent: false };
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
    }

    const existing = await prisma.birthdayGreeting.findUnique({ where: { customerId_year: { customerId, year } } });
    if (!existing) {
      throw new AppError('Invio auguri in corso, riprova', 409, 'BIRTHDAY_SEND_IN_PROGRESS');
    }

    const isStale = existing.status === 'SENDING' && existing.updatedAt.getTime() < Date.now() - STALE_CLAIM_MS;
    const canTakeOver = isStale || (resend && existing.status === 'SENT');
    if (!canTakeOver) {
      throw existing.status === 'SENT'
        ? new AppError('Auguri già inviati quest\'anno a questo cliente', 409, 'BIRTHDAY_ALREADY_SENT')
        : new AppError('Invio auguri già in corso per questo cliente', 409, 'BIRTHDAY_SEND_IN_PROGRESS');
    }

    // Il confronto su updatedAt rende la ripresa atomica: vince un solo processo.
    const taken = await prisma.birthdayGreeting.updateMany({
      where: { id: existing.id, updatedAt: existing.updatedAt },
      data: { status: 'SENDING' },
    });
    if (taken.count !== 1) {
      throw new AppError('Invio auguri già in corso per questo cliente', 409, 'BIRTHDAY_SEND_IN_PROGRESS');
    }
    return { id: existing.id, wasSent: existing.status === 'SENT' };
  }

  /** Un reinvio fallito non deve cancellare la traccia del primo invio riuscito. */
  private async releaseGreeting(claim: GreetingClaim): Promise<void> {
    if (claim.wasSent) {
      await prisma.birthdayGreeting.updateMany({ where: { id: claim.id, status: 'SENDING' }, data: { status: 'SENT' } });
      return;
    }
    await prisma.birthdayGreeting.deleteMany({ where: { id: claim.id, status: 'SENDING' } });
  }

  /** Autore degli invii automatici: il primo super admin, poi il primo admin. */
  private async systemUserId(): Promise<number> {
    for (const role of ['SUPER_ADMIN', 'ADMIN'] as const) {
      const user = await prisma.user.findFirst({ where: { role, deletedAt: null }, orderBy: { id: 'asc' }, select: { id: true } });
      if (user) return user.id;
    }
    throw new AppError('Nessun amministratore attivo a cui attribuire l\'invio', 500, 'SYSTEM_USER_MISSING');
  }
}

export class BirthdayReminderScheduler {
  private timer: NodeJS.Timeout | null = null;
  private startupTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly executedRuns = new Set<string>();

  // Slot di invio e di ripetizione per chi non è stato raggiunto (ore italiane).
  private readonly slotHours = [10, 11, 12];
  // Oltre l'ultimo slot si fa un unico recupero, per un server avviato in ritardo.
  private readonly lastCatchUpHour = 20;

  constructor(
    private readonly reminderService: BirthdayReminderService,
    private readonly isFeatureEnabled: () => Promise<boolean> = async () => true,
  ) {}

  start(): void {
    if (this.timer) return;
    logger.info('[BirthdayReminderScheduler] Scheduler avviato (slot: ore 10:00, 11:00, 12:00 italiane)');
    this.timer = setInterval(() => void this.checkAndRun(), 5 * 60 * 1000);
    this.startupTimer = setTimeout(() => void this.checkAndRun(), 5000);
  }

  stop(): void {
    if (this.startupTimer) clearTimeout(this.startupTimer);
    this.startupTimer = null;
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
    logger.info('[BirthdayReminderScheduler] Scheduler fermato');
  }

  async checkAndRun(now = new Date()): Promise<void> {
    if (this.isRunning) return;

    const today = todayInZone(undefined, now);
    const hour = hourInZone(undefined, now);
    const firstSlot = this.slotHours[0];
    const lastSlot = this.slotHours[this.slotHours.length - 1];
    if (hour < firstSlot || hour > this.lastCatchUpHour) return;

    const runKey = hour <= lastSlot ? `${today}:${hour}` : `${today}:recupero`;
    for (const key of this.executedRuns) {
      if (!key.startsWith(today)) this.executedRuns.delete(key);
    }
    if (this.executedRuns.has(runKey)) return;

    if (!(await this.isFeatureEnabled())) return;

    if (!this.reminderService.isAutoSendAvailable()) {
      logger.info(`[BirthdayReminderScheduler] WhatsApp non collegato: invio delle ${hour}:00 rimandato`);
      return;
    }

    this.isRunning = true;
    try {
      const result = await this.reminderService.sendAllTodayBirthdayGreetings(undefined, now);
      this.executedRuns.add(runKey);
      logger.info(`[BirthdayReminderScheduler] Controllo compleanni delle ${hour}:00 completato`, {
        processedCount: result.processedCount,
        sentCount: result.sentCount,
        failedCount: result.failedCount,
      });
    } catch (err) {
      logger.error(`[BirthdayReminderScheduler] Errore nel controllo compleanni delle ${hour}:00`, {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      this.isRunning = false;
    }
  }
}
