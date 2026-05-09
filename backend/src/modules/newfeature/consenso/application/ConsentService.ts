import prisma from '../../../../shared/utils/prisma';
import { PdfGenerator } from '../infrastructure/PdfGenerator';
import { MedicalAnswers } from '../domain/Consent';
import { logger } from '../../../../shared/utils/logger';

export class ConsentService {
  async processConsent(
    bookingId: number,
    customerName: string,
    phone: string,
    documentId: string,
    medicalAnswers: MedicalAnswers,
    signatureB64: string
  ) {
    // 1. Generate the PDF file
    const pdfResult = await PdfGenerator.generateConsentPdf({
      bookingId,
      customerName,
      documentId,
      phone,
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
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new Error('Prenotazione non trovata durante il salvataggio del consenso');
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
