import { Request, Response, NextFunction } from 'express';
import prisma from '../../../../shared/utils/prisma';
import { configService } from '../../../../container';
import { PdfGenerator } from '../infrastructure/PdfGenerator';
import { logger } from '../../../../shared/utils/logger';

export class ConsentController {
  // GET /api/newfeature/config
  async getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const showConsensi = await configService.getShowConsensi();
      res.json({ success: true, showConsensi });
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

      // 1. Generate the PDF file
      const pdfResult = await PdfGenerator.generateConsentPdf({
        bookingId,
        customerName,
        documentId,
        phone: booking.customer.phone,
        medicalAnswers,
        signatureB64,
      });

      // 2. Register the PDF in the Attachment table via Prisma
      const attachment = await prisma.attachment.create({
        data: {
          bookingId,
          fileName: pdfResult.fileName,
          fileSize: pdfResult.fileSize,
          mimeType: 'application/pdf',
          filePath: `/uploads/attachments/${pdfResult.fileName}`,
        },
      });

      // 3. Compile medical alerts
      const alerts: string[] = [];
      if (medicalAnswers.gravidanza) alerts.push('Stato di gravidanza/allattamento');
      if (medicalAnswers.allergie) alerts.push(`Allergia: ${medicalAnswers.allergieDettagli || 'SÌ'}`);
      if (medicalAnswers.anticoagulanti) alerts.push('Uso farmaci anticoagulanti');
      if (medicalAnswers.cardiopatie) alerts.push('Soffre di cardiopatie/problemi cardiaci');
      if (medicalAnswers.epilessia) alerts.push('Soffre di epilessia');
      if (medicalAnswers.diabete) alerts.push('Soffre di diabete');
      if (medicalAnswers.malattieInfettive) alerts.push('Soffre di malattie infettive trasmissibili');

      const hasMedicalAlerts = alerts.length > 0;
      const medicalAlertsDetails = alerts.join(' | ');

      // 4. Update the Booking's formData JSON with consent state
      const currentFormData = (booking.formData as Record<string, any>) || {};
      const updatedFormData = {
        ...currentFormData,
        consent: {
          signed: true,
          signedAt: new Date().toISOString(),
          documentId,
          hasMedicalAlerts,
          medicalAlertsDetails,
          answers: medicalAnswers,
          attachmentId: attachment.id,
        },
      };

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          formData: updatedFormData,
        },
      });

      logger.info('Consenso informato registrato con successo', {
        bookingId,
        attachmentId: attachment.id,
        hasMedicalAlerts,
      });

      res.json({
        success: true,
        message: 'Consenso informato firmato e archiviato con successo!',
        data: {
          attachmentId: attachment.id,
          hasMedicalAlerts,
          medicalAlertsDetails,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
