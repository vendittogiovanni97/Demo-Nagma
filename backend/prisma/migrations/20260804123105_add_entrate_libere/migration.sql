-- CreateTable
CREATE TABLE "entrate_libere" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entrate_libere_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "entrate_libere_createdAt_idx" ON "entrate_libere"("createdAt");

-- CreateIndex
CREATE INDEX "entrate_libere_deletedAt_idx" ON "entrate_libere"("deletedAt");
