import { Request, Response, NextFunction } from 'express';
import prisma from '../../../../shared/utils/prisma';
import { ConsentService } from '../application/ConsentService';
import { configService } from '../../../../container';

export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  // GET /api/newfeature/config
  async getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const SHOW_CONSENSI = await configService.getShowConsensi();
      const SHOW_POSIZIONAMENTO = await configService.getShowPosizionamento();
      res.json({ success: true, SHOW_CONSENSI, SHOW_POSIZIONAMENTO });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/newfeature/booking/:id
  async getBookingPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const bookingId = parseInt(idParam || '', 10);
      if (isNaN(bookingId)) {
        res.status(400).json({ success: false, message: 'ID prenotazione non valido' });
        return;
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          artist: true,
        },
      });

      if (!booking || booking.deletedAt) {
        res.status(404).json({ success: false, message: 'Prenotazione non trovata' });
        return;
      }

      // Check if showConsensi is disabled globally
      const showConsensi = await configService.getShowConsensi();
      if (!showConsensi) {
        res.status(403).json({ success: false, message: 'Funzionalità consensi non abilitata per questo studio' });
        return;
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
    } catch (err) {
      next(err);
    }
  }

  // POST /api/newfeature/booking/:id/consent
  async submitConsent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const bookingId = parseInt(idParam || '', 10);
      if (isNaN(bookingId)) {
        res.status(400).json({ success: false, message: 'ID prenotazione non valido' });
        return;
      }

      const showConsensi = await configService.getShowConsensi();
      if (!showConsensi) {
        res.status(403).json({ success: false, message: 'Funzionalità consensi non abilitata per questo studio' });
        return;
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { customer: true },
      });

      if (!booking || booking.deletedAt) {
        res.status(404).json({ success: false, message: 'Prenotazione non trovata' });
        return;
      }

      const { documentId, medicalAnswers, signatureB64 } = req.body;

      if (!documentId || !medicalAnswers || !signatureB64) {
        res.status(400).json({ success: false, message: 'Dati obbligatori mancanti' });
        return;
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
    } catch (err) {
      next(err);
    }
  }

  // GET /api/newfeature/consents  (admin-only, protected by authMiddleware in routes)
  async listConsents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const showConsensi = await configService.getShowConsensi();
      if (!showConsensi) {
        res.status(403).json({ success: false, message: 'Funzionalità consensi non abilitata' });
        return;
      }

      // Fetch all non-deleted bookings whose formData contains consent.signed = true
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
    } catch (err) {
      next(err);
    }
  }
}
