ALTER TABLE "WhatsAppTemplate"
ADD COLUMN "category" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TYPE "WhatsAppMessageStatus" AS ENUM ('MANUAL_SENT', 'FAILED');

CREATE TABLE "WhatsAppMessageLog" (
    "id" TEXT NOT NULL,
    "templateId" TEXT,
    "bookingId" TEXT,
    "customerId" TEXT,
    "createdById" TEXT NOT NULL,
    "recipientName" TEXT,
    "recipientPhone" TEXT NOT NULL,
    "templateName" TEXT,
    "message" TEXT NOT NULL,
    "status" "WhatsAppMessageStatus" NOT NULL DEFAULT 'MANUAL_SENT',
    "variablesJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppMessageLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WhatsAppMessageLog_templateId_idx" ON "WhatsAppMessageLog"("templateId");
CREATE INDEX "WhatsAppMessageLog_bookingId_idx" ON "WhatsAppMessageLog"("bookingId");
CREATE INDEX "WhatsAppMessageLog_customerId_idx" ON "WhatsAppMessageLog"("customerId");
CREATE INDEX "WhatsAppMessageLog_createdById_idx" ON "WhatsAppMessageLog"("createdById");
CREATE INDEX "WhatsAppMessageLog_createdAt_idx" ON "WhatsAppMessageLog"("createdAt");

ALTER TABLE "WhatsAppMessageLog"
ADD CONSTRAINT "WhatsAppMessageLog_templateId_fkey"
FOREIGN KEY ("templateId") REFERENCES "WhatsAppTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WhatsAppMessageLog"
ADD CONSTRAINT "WhatsAppMessageLog_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WhatsAppMessageLog"
ADD CONSTRAINT "WhatsAppMessageLog_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WhatsAppMessageLog"
ADD CONSTRAINT "WhatsAppMessageLog_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
