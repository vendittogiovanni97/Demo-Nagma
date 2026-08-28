-- Partial unique index on users.email (active users only).
-- A soft-deleted user must not permanently block re-registration of its email.
-- The UNIQUE constraint created by Prisma's @unique is dropped in favour of a
-- partial unique index (WHERE "deletedAt" IS NULL). The app-level uniqueness
-- check (findFirst with deletedAt: null) remains in authService.register.

-- DropIndex
DROP INDEX IF EXISTS "users_email_key";

-- Create partial unique index
CREATE UNIQUE INDEX "users_email_active_unique" ON "users" ("email") WHERE "deletedAt" IS NULL;