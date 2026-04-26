-- CreateTable
CREATE TABLE "Config" (
    "id" SERIAL NOT NULL,
    "paramsKey" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_paramsKey_key" ON "Config"("paramsKey");

-- CreateIndex
CREATE INDEX "Config_paramsKey_idx" ON "Config"("paramsKey");

-- CreateIndex
CREATE INDEX "Attachment_bookingId_idx" ON "Attachment"("bookingId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
