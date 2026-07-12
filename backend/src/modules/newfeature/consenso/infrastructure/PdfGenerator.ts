import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../../../core/shared/utils/logger';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'attachments');
const ALLOWED_FIELDS = ['maggiorenne', 'gravidanza', 'allergie', 'allergieDettagli', 'anticoagulanti', 'cardiopatie', 'epilessia', 'malattieInfettive', 'diabete', 'accettaPermanenza', 'accettaPrivacy'];

export class PdfGenerator {
  static async generateConsentPdf(params: {
    bookingId: number;
    customerName: string;
    documentId: string;
    phone: string;
    medicalAnswers: Record<string, any>;
    signatureB64: string;
  }): Promise<{ fileName: string; filePath: string; fileSize: number }> {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const fileName = `consent_${params.bookingId}_${Date.now()}.pdf`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    await new Promise<void>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        doc.fontSize(20).text('Consenso Informato', { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(12).text(`Cliente: ${params.customerName}`);
        doc.text(`Documento: ${params.documentId}`);
        doc.text(`Telefono: ${params.phone}`);
        doc.text(`Prenotazione #: ${params.bookingId}`);
        doc.moveDown();

        doc.fontSize(14).text('Questionario Medico:', { underline: true });
        doc.moveDown(0.5);

        for (const [key, value] of Object.entries(params.medicalAnswers)) {
          if (key === 'allergieDettagli' && !value) continue;
          const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          doc.fontSize(11).text(`${label}: ${typeof value === 'boolean' ? (value ? 'Sì' : 'No') : (value || 'N/A')}`);
        }

        doc.moveDown(2);
        doc.text('Firma:', { underline: true });
        doc.moveDown(0.5);

        if (params.signatureB64) {
          const signatureBuffer = Buffer.from(params.signatureB64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
          try {
            doc.image(signatureBuffer, 0, 0, { fit: [200, 80], align: 'center' } as any);
          } catch {
            doc.text('[Firma non visualizzabile]');
          }
        }

        doc.moveDown(2);
        doc.fontSize(9).text(`Generato il: ${new Date().toLocaleString('it-IT')}`, { align: 'center' });

        doc.end();

        writeStream.on('finish', () => {
          const stats = fs.statSync(filePath);
          logger.info('PDF consenso generato', { fileName, fileSize: stats.size });
          resolve();
        });

        writeStream.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });

    const stats = fs.statSync(filePath);
    return { fileName, filePath: `/uploads/attachments/${fileName}`, fileSize: stats.size };
  }
}
