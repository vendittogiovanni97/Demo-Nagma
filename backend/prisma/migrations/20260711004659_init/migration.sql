-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER', 'ARTIST');

-- CreateEnum
CREATE TYPE "StaffType" AS ENUM ('COLLABORATORE', 'APPRENDISTA');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CREATO', 'CONFERMATO', 'COMPLETATO', 'MODIFICATO', 'SPOSTATO', 'ANNULLATO', 'CANCELLATO');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('ENTRATA', 'USCITA');

-- CreateEnum
CREATE TYPE "WhatsAppMessageStatus" AS ENUM ('MANUAL_SENT', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "phone" TEXT,
    "color" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StaffType" NOT NULL,
    "color" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakDuration" INTEGER,
    "notes" TEXT,
    "staffId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "artistId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 120,
    "status" "BookingStatus" NOT NULL DEFAULT 'CREATO',
    "price" DECIMAL(10,2),
    "deposit" DECIMAL(10,2),
    "notes" TEXT,
    "outlookEventId" TEXT,
    "formData" JSONB,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cream_tattoos" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Crema Protettiva Tattoo',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cream_tattoos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cream_sales" (
    "id" SERIAL NOT NULL,
    "creamId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cream_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_histories" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "action" "BookingStatus" NOT NULL,
    "oldDate" TIMESTAMP(3),
    "newDate" TIMESTAMP(3),
    "changedById" INTEGER,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachmentUrl" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceId" INTEGER,
    "sourceType" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_histories" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "changedById" INTEGER,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "schemaB64" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spese_libere" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spese_libere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "body" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_message_logs" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER,
    "bookingId" INTEGER,
    "customerId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "recipientName" TEXT,
    "recipientPhone" TEXT NOT NULL,
    "templateName" TEXT,
    "message" TEXT NOT NULL,
    "status" "WhatsAppMessageStatus" NOT NULL DEFAULT 'MANUAL_SENT',
    "variablesJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "whatsapp_message_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configs" (
    "id" SERIAL NOT NULL,
    "paramsKey" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_placements" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "bodyZone" TEXT NOT NULL,
    "view" TEXT DEFAULT 'FRONT',
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "sizeWidth" DOUBLE PRECISION,
    "sizeHeight" DOUBLE PRECISION,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_placements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "staff_type_idx" ON "staff"("type");

-- CreateIndex
CREATE INDEX "staff_createdAt_idx" ON "staff"("createdAt");

-- CreateIndex
CREATE INDEX "staff_deletedAt_idx" ON "staff"("deletedAt");

-- CreateIndex
CREATE INDEX "shifts_date_idx" ON "shifts"("date");

-- CreateIndex
CREATE INDEX "shifts_staffId_date_idx" ON "shifts"("staffId", "date");

-- CreateIndex
CREATE INDEX "shifts_deletedAt_idx" ON "shifts"("deletedAt");

-- CreateIndex
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_lastName_firstName_idx" ON "customers"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "customers_deletedAt_createdAt_idx" ON "customers"("deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "bookings_customerId_deletedAt_idx" ON "bookings"("customerId", "deletedAt");

-- CreateIndex
CREATE INDEX "bookings_artistId_date_idx" ON "bookings"("artistId", "date");

-- CreateIndex
CREATE INDEX "bookings_artistId_status_date_idx" ON "bookings"("artistId", "status", "date");

-- CreateIndex
CREATE INDEX "bookings_status_date_idx" ON "bookings"("status", "date");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_date_idx" ON "bookings"("date");

-- CreateIndex
CREATE INDEX "cream_tattoos_deletedAt_idx" ON "cream_tattoos"("deletedAt");

-- CreateIndex
CREATE INDEX "cream_sales_creamId_soldAt_idx" ON "cream_sales"("creamId", "soldAt");

-- CreateIndex
CREATE INDEX "cream_sales_artistId_soldAt_idx" ON "cream_sales"("artistId", "soldAt");

-- CreateIndex
CREATE INDEX "cream_sales_deletedAt_idx" ON "cream_sales"("deletedAt");

-- CreateIndex
CREATE INDEX "booking_histories_bookingId_changedAt_idx" ON "booking_histories"("bookingId", "changedAt");

-- CreateIndex
CREATE INDEX "booking_histories_changedById_idx" ON "booking_histories"("changedById");

-- CreateIndex
CREATE INDEX "transactions_date_type_idx" ON "transactions"("date", "type");

-- CreateIndex
CREATE INDEX "transactions_deletedAt_idx" ON "transactions"("deletedAt");

-- CreateIndex
CREATE INDEX "transactions_category_idx" ON "transactions"("category");

-- CreateIndex
CREATE INDEX "transactions_sourceId_sourceType_idx" ON "transactions"("sourceId", "sourceType");

-- CreateIndex
CREATE INDEX "transaction_histories_transactionId_changedAt_idx" ON "transaction_histories"("transactionId", "changedAt");

-- CreateIndex
CREATE INDEX "transaction_histories_changedById_idx" ON "transaction_histories"("changedById");

-- CreateIndex
CREATE INDEX "form_templates_deletedAt_idx" ON "form_templates"("deletedAt");

-- CreateIndex
CREATE INDEX "spese_libere_createdAt_idx" ON "spese_libere"("createdAt");

-- CreateIndex
CREATE INDEX "spese_libere_deletedAt_idx" ON "spese_libere"("deletedAt");

-- CreateIndex
CREATE INDEX "whatsapp_templates_category_idx" ON "whatsapp_templates"("category");

-- CreateIndex
CREATE INDEX "whatsapp_templates_isActive_idx" ON "whatsapp_templates"("isActive");

-- CreateIndex
CREATE INDEX "whatsapp_templates_deletedAt_idx" ON "whatsapp_templates"("deletedAt");

-- CreateIndex
CREATE INDEX "whatsapp_message_logs_customerId_createdAt_idx" ON "whatsapp_message_logs"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "whatsapp_message_logs_status_createdAt_idx" ON "whatsapp_message_logs"("status", "createdAt");

-- CreateIndex
CREATE INDEX "whatsapp_message_logs_templateId_createdAt_idx" ON "whatsapp_message_logs"("templateId", "createdAt");

-- CreateIndex
CREATE INDEX "whatsapp_message_logs_createdById_idx" ON "whatsapp_message_logs"("createdById");

-- CreateIndex
CREATE INDEX "whatsapp_message_logs_deletedAt_idx" ON "whatsapp_message_logs"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "configs_paramsKey_key" ON "configs"("paramsKey");

-- CreateIndex
CREATE INDEX "configs_paramsKey_idx" ON "configs"("paramsKey");

-- CreateIndex
CREATE INDEX "configs_deletedAt_idx" ON "configs"("deletedAt");

-- CreateIndex
CREATE INDEX "attachments_bookingId_idx" ON "attachments"("bookingId");

-- CreateIndex
CREATE INDEX "attachments_deletedAt_idx" ON "attachments"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "booking_placements_bookingId_key" ON "booking_placements"("bookingId");

-- CreateIndex
CREATE INDEX "booking_placements_bookingId_idx" ON "booking_placements"("bookingId");

-- CreateIndex
CREATE INDEX "booking_placements_deletedAt_idx" ON "booking_placements"("deletedAt");

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cream_sales" ADD CONSTRAINT "cream_sales_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cream_sales" ADD CONSTRAINT "cream_sales_creamId_fkey" FOREIGN KEY ("creamId") REFERENCES "cream_tattoos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_histories" ADD CONSTRAINT "booking_histories_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_histories" ADD CONSTRAINT "booking_histories_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_histories" ADD CONSTRAINT "transaction_histories_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_histories" ADD CONSTRAINT "transaction_histories_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_message_logs" ADD CONSTRAINT "whatsapp_message_logs_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_message_logs" ADD CONSTRAINT "whatsapp_message_logs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_message_logs" ADD CONSTRAINT "whatsapp_message_logs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_message_logs" ADD CONSTRAINT "whatsapp_message_logs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "whatsapp_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_placements" ADD CONSTRAINT "booking_placements_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
