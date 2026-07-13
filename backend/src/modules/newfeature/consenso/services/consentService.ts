import prisma from '../../../../core/shared/utils/prisma';
import { PdfGenerator } from '../infrastructure/PdfGenerator';
import { logger } from '../../../../core/shared/utils/logger';
import { AppError } from '../../../../core/shared/errors/AppError';

export interface MedicalAnswers {
  maggiorenne: boolean;
  gravidanza: boolean;
  allergie: boolean;
  allergieDettagli?: string;
  anticoagulanti: boolean;
  cardiopatie: boolean;
  epilessia: boolean;
  malattieInfettive: boolean;
  diabete: boolean;
  accettaPermanenza: boolean;
  accettaPrivacy: boolean;
}

export class ConsentService {
  async processConsent(
    bookingId: number,
    customerName: string,
    phone: string,
    documentId: string,
    medicalAnswers: MedicalAnswers,
    signatureB64: string
  ) {
    const pdfResult = await PdfGenerator.generateConsentPdf({
      bookingId,
      customerName,
      documentId,
      phone,
      medicalAnswers,
      signatureB64,
    });

    const attachment = await prisma.attachment.create({
      data: {
        bookingId,
        fileName: pdfResult.fileName,
        fileSize: pdfResult.fileSize,
        mimeType: 'application/pdf',
        filePath: `/uploads/attachments/${pdfResult.fileName}`,
      },
    });

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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new AppError('Prenotazione non trovata durante il salvataggio del consenso', 404, 'BOOKING_NOT_FOUND');
    }

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
        formData: updatedFormData as any,
      },
    });

    logger.info('Consenso informato registrato con successo tramite ConsentService', {
      bookingId,
      attachmentId: attachment.id,
      hasMedicalAlerts,
    });

    return {
      attachmentId: attachment.id,
      hasMedicalAlerts,
      medicalAlertsDetails,
    };
  }
}
