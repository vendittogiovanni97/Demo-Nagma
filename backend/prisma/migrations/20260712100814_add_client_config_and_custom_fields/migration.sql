-- CreateTable
CREATE TABLE "client_configs" (
    "id" SERIAL NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientLogoUrl" TEXT,
    "clientTimeZone" TEXT NOT NULL DEFAULT 'Europe/Rome',
    "clientLocale" TEXT NOT NULL DEFAULT 'it-IT',
    "primaryColor" TEXT NOT NULL DEFAULT '#1976d2',
    "secondaryColor" TEXT NOT NULL DEFAULT '#ff9800',
    "features" JSONB NOT NULL,
    "maxUsers" INTEGER NOT NULL DEFAULT 50,
    "maxBookings" INTEGER NOT NULL DEFAULT 10000,
    "maxAttachmentSizeMB" INTEGER NOT NULL DEFAULT 50,
    "apiRateLimitPerMinute" INTEGER NOT NULL DEFAULT 100,
    "customFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_fields" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "defaultValue" JSONB,
    "clientId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_fields_clientId_idx" ON "custom_fields"("clientId");

-- CreateIndex
CREATE INDEX "custom_fields_entityType_idx" ON "custom_fields"("entityType");

-- CreateIndex
CREATE INDEX "custom_fields_deletedAt_idx" ON "custom_fields"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "custom_fields_entityType_fieldName_clientId_key" ON "custom_fields"("entityType", "fieldName", "clientId");

-- AddForeignKey
ALTER TABLE "custom_fields" ADD CONSTRAINT "custom_fields_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
