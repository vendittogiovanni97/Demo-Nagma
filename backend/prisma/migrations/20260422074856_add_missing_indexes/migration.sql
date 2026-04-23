-- CreateIndex
CREATE INDEX "BookingHistory_bookingId_changedAt_idx" ON "BookingHistory"("bookingId", "changedAt");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_lastName_firstName_idx" ON "Customer"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Shift_date_idx" ON "Shift"("date");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "WhatsAppTemplate_category_idx" ON "WhatsAppTemplate"("category");

-- CreateIndex
CREATE INDEX "WhatsAppTemplate_isActive_idx" ON "WhatsAppTemplate"("isActive");
