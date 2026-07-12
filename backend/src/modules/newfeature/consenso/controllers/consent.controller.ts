import { Request, Response } from 'express';
import { ConsentService } from '../services/consentService';
import { ConfigService } from '../../../../modules/config/services/configService';
import { asyncHandler } from '../../../../core/shared/utils/asyncHandler';
import prisma from '../../../../core/shared/utils/prisma';

export class ConsentController {
  constructor(
    private readonly consentService: ConsentService,
    private readonly configService: ConfigService
  ) {}

  getBookingPublic = asyncHandler(async (req: Request, res: Response) => {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const bookingId = parseInt(idParam || '', 10);
    if (isNaN(bookingId)) {
      return res.status(400).json({ success: false, message: 'ID prenotazione non valido' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, artist: true },
    });

    if (!booking || booking.deletedAt) {
      return res.status(404).json({ success: false, message: 'Prenotazione non trovata' });
    }

    const showConsensi = await this.configService.getShowConsensi();
    if (!showConsensi) {
      return res.status(403).json({ success: false, message: 'Funzionalità consensi non abilitata per questo studio' });
    }

    const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
    const artistName = booking.artist ? booking.artist.name : 'Artista non assegnato';

    res.json({
      success: true,
      data: {
        bookingId: booking.id,
        customerName,
        phone: booking.customer.phone,
        artistName,
        date: booking.date,
      },
    });
  });

  submitConsent = asyncHandler(async (req: Request, res: Response) => {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const bookingId = parseInt(idParam || '', 10);
    if (isNaN(bookingId)) {
      return res.status(400).json({ success: false, message: 'ID prenotazione non valido' });
    }

    const showConsensi = await this.configService.getShowConsensi();
    if (!showConsensi) {
      return res.status(403).json({ success: false, message: 'Funzionalità consensi non abilitata per questo studio' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true },
    });

    if (!booking || booking.deletedAt) {
      return res.status(404).json({ success: false, message: 'Prenotazione non trovata' });
    }

    const { documentId, medicalAnswers, signatureB64 } = req.body;

    if (!documentId || !medicalAnswers || !signatureB64) {
      return res.status(400).json({ success: false, message: 'Dati obbligatori mancanti' });
    }

    const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;

    const result = await this.consentService.processConsent(
      bookingId,
      customerName,
      booking.customer.phone,
      documentId,
      medicalAnswers,
      signatureB64
    );

    res.json({
      success: true,
      message: 'Consenso informato firmato e archiviato con successo!',
      data: result,
    });
  });

  listConsents = asyncHandler(async (_req: Request, res: Response) => {
    const showConsensi = await this.configService.getShowConsensi();
    if (!showConsensi) {
      return res.status(403).json({ success: false, message: 'Funzionalità consensi non abilitata' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        deletedAt: null,
        formData: {
          path: ['consent', 'signed'],
          equals: true,
        } as any,
      },
      include: {
        customer: { select: { firstName: true, lastName: true, phone: true } },
        artist: { select: { name: true } },
        attachments: {
          where: { mimeType: 'application/pdf' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, fileName: true, filePath: true, createdAt: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    const data = bookings.map((b) => {
      const consent = (b.formData as Record<string, any>)?.consent ?? {};
      return {
        bookingId: b.id,
        date: b.date,
        customerName: `${b.customer.firstName} ${b.customer.lastName}`,
        phone: b.customer.phone,
        artistName: b.artist?.name ?? null,
        signedAt: consent.signedAt ?? null,
        documentId: consent.documentId ?? null,
        hasMedicalAlerts: consent.hasMedicalAlerts ?? false,
        medicalAlertsDetails: consent.medicalAlertsDetails ?? '',
        attachment: b.attachments[0] ?? null,
      };
    });

    res.json({ success: true, data });
  });
}
