-- CreateIndex
CREATE INDEX IF NOT EXISTS "bookings_deletedAt_date_idx" ON "bookings"("deletedAt", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "bookings_deletedAt_status_date_idx" ON "bookings"("deletedAt", "status", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transactions_deletedAt_date_idx" ON "transactions"("deletedAt", "date");
