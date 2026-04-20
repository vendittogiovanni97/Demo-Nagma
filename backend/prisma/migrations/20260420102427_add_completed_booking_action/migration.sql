-- AlterEnum
ALTER TYPE "BookingAction" ADD VALUE 'COMPLETED';

-- CreateIndex
CREATE INDEX "Booking_artistId_status_date_idx" ON "Booking"("artistId", "status", "date");

-- CreateIndex
CREATE INDEX "Booking_status_date_idx" ON "Booking"("status", "date");

-- CreateIndex
CREATE INDEX "WhatsAppMessageLog_status_createdAt_idx" ON "WhatsAppMessageLog"("status", "createdAt");

-- CreateIndex
CREATE INDEX "WhatsAppMessageLog_templateId_createdAt_idx" ON "WhatsAppMessageLog"("templateId", "createdAt");
