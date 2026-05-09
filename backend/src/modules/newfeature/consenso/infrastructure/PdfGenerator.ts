import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

interface MedicalAnswers {
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

interface PdfGeneratorInput {
  bookingId: number;
  customerName: string;
  documentId: string;
  phone: string;
  medicalAnswers: MedicalAnswers;
  signatureB64: string; // Base64 PNG signature
}

export class PdfGenerator {
  static async generateConsentPdf(input: PdfGeneratorInput): Promise<{
    filePath: string;
    fileName: string;
    fileSize: number;
  }> {
    return new Promise((resolve, reject) => {
      try {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'attachments');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const timestamp = Date.now();
        const fileName = `Consenso_Informato_${input.bookingId}_${timestamp}.pdf`;
        const filePath = path.join(uploadsDir, fileName);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // --- LETTERHEAD / LOGO NAGMA ---
        doc.fillColor('#111827').rect(0, 0, 595.28, 90).fill('#111827'); // Header background
        doc.fillColor('#9155FD').fontSize(24).font('Helvetica-Bold').text('NAGMA TATTOO STUDIO', 50, 25, { characterSpacing: 1 });
        doc.fillColor('#9CA3AF').fontSize(9).font('Helvetica').text('GESTIONALE CONSENSO INFORMATO DIGITALE', 50, 55, { characterSpacing: 0.5 });

        // Reset text color for body
        doc.fillColor('#1F2937');

        doc.moveDown(4);

        // --- TITLE ---
        doc.font('Helvetica-Bold').fontSize(16).text('CONSENSO INFORMATO AI TRATTAMENTI DI TATUAGGIO', { align: 'center' });
        doc.moveDown(1.5);

        // --- CLIENT DETAILS SECTION ---
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#9155FD').text('DATI ANAGRAFICI DEL SOGGETTO');
        doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y + 3).lineTo(545.28, doc.y + 3).stroke();
        doc.moveDown(0.8);

        doc.font('Helvetica').fontSize(10).fillColor('#374151');
        doc.text(`Nome e Cognome: `, { continued: true }).font('Helvetica-Bold').text(input.customerName);
        doc.font('Helvetica').text(`Documento d'Identità: `, { continued: true }).font('Helvetica-Bold').text(input.documentId);
        doc.font('Helvetica').text(`Telefono cellulare: `, { continued: true }).font('Helvetica-Bold').text(input.phone);
        doc.font('Helvetica').text(`Identificativo Prenotazione: `, { continued: true }).font('Helvetica-Bold').text(`#${input.bookingId}`);
        
        doc.moveDown(2);

        // --- HEALTH QUESTIONNAIRE SECTION ---
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#9155FD').text('DICHIARAZIONE SULLO STATO DI SALUTE');
        doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y + 3).lineTo(545.28, doc.y + 3).stroke();
        doc.moveDown(0.8);

        const questions: { key: keyof MedicalAnswers; text: string }[] = [
          { key: 'maggiorenne', text: 'Dichiaro di essere maggiorenne (o legalmente autorizzato)' },
          { key: 'gravidanza', text: 'Si trova in stato di gravidanza o allattamento?' },
          { key: 'allergie', text: 'Soffre di allergie a metalli, nichel, lattice o disinfettanti?' },
          { key: 'anticoagulanti', text: 'Assume farmaci anticoagulanti?' },
          { key: 'cardiopatie', text: 'Soffre di patologie cardiovascolari o problemi cardiaci?' },
          { key: 'epilessia', text: 'Soffre di epilessia?' },
          { key: 'diabete', text: 'Soffre di diabete?' },
          { key: 'malattieInfettive', text: 'È affetto da malattie infettive trasmissibili (es. epatite, HIV)?' },
          { key: 'accettaPermanenza', text: 'Dichiaro di essere a conoscenza che il tatuaggio è permanente' },
          { key: 'accettaPrivacy', text: 'Consento al trattamento dei miei dati personali (GDPR)' }
        ];

        doc.fontSize(9).font('Helvetica');

        for (const q of questions) {
          const val = input.medicalAnswers[q.key];
          let ansText = '';
          let ansColor = '#374151';

          if (q.key === 'maggiorenne' || q.key === 'accettaPermanenza' || q.key === 'accettaPrivacy') {
            ansText = val ? 'SÌ, DICHIARO' : 'NO';
            ansColor = val ? '#10B981' : '#EF4444'; // Green for ok, red for warning
          } else {
            ansText = val ? 'SÌ' : 'NO';
            ansColor = val ? '#EF4444' : '#10B981'; // Red for YES to illness (warning), green for NO
          }

          const currentY = doc.y;
          doc.fillColor('#374151').text(q.text, 50, currentY, { width: 400 });
          doc.fillColor(ansColor).font('Helvetica-Bold').text(ansText, 480, currentY, { align: 'right' });
          doc.font('Helvetica');

          if (q.key === 'allergie' && input.medicalAnswers.allergie && input.medicalAnswers.allergieDettagli) {
            doc.moveDown(0.2);
            doc.fillColor('#EF4444').font('Helvetica-Oblique').text(`Dettaglio allergia: ${input.medicalAnswers.allergieDettagli}`, 70, doc.y, { width: 380 });
            doc.font('Helvetica');
          }

          doc.moveDown(0.6);
        }

        doc.moveDown(2);

        // --- SIGNATURE SECTION ---
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#9155FD').text('SOTTOSCRIZIONE E FIRMA');
        doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y + 3).lineTo(545.28, doc.y + 3).stroke();
        doc.moveDown(0.8);

        doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text(
          'Apponendo la firma sottostante, il cliente dichiara che tutte le risposte fornite corrispondono al vero e che esprime pieno consenso informato all\'esecuzione del tatuaggio in conformità alle leggi e alle linee guida igienico-sanitarie vigenti.',
          { width: 495 }
        );

        doc.moveDown(1);

        // Draw Signature Box
        const signatureY = doc.y;
        doc.rect(50, signatureY, 250, 90).strokeColor('#D1D5DB').lineWidth(1).stroke();
        doc.fillColor('#9CA3AF').fontSize(8).text('FIRMA GRAFICA DEL CLIENTE', 55, signatureY + 5);

        // Embed Base64 Signature Image
        try {
          const sigB64Clean = input.signatureB64.replace(/^data:image\/\w+;base64,/, '');
          const sigBuffer = Buffer.from(sigB64Clean, 'base64');
          doc.image(sigBuffer, 60, signatureY + 15, { width: 230, height: 70 });
        } catch (sigErr) {
          doc.fillColor('#EF4444').text('[Errore di caricamento firma grafica]', 60, signatureY + 40);
        }

        // Draw Date Box
        doc.rect(340, signatureY, 205, 90).strokeColor('#D1D5DB').lineWidth(1).stroke();
        doc.fillColor('#9CA3AF').fontSize(8).text('DATA DI SOTTOSCRIZIONE', 345, signatureY + 5);
        doc.fillColor('#1F2937').fontSize(11).font('Helvetica-Bold').text(
          new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          345,
          signatureY + 35
        );

        // End PDF Document
        doc.end();

        stream.on('finish', () => {
          try {
            const stats = fs.statSync(filePath);
            resolve({
              filePath,
              fileName,
              fileSize: stats.size,
            });
          } catch (err) {
            reject(err);
          }
        });

        stream.on('error', (err) => {
          reject(err);
        });

      } catch (err) {
        reject(err);
      }
    });
  }
}
