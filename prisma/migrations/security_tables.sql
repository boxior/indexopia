-- Security tables for rate limiting, account lockout, and logging
-- Run this migration: npx prisma migrate dev --name add_security_tables

-- Rate limiting table
CREATE TABLE IF NOT EXISTS "RateLimit" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RateLimit_identifier_type_createdAt_idx" ON "RateLimit"("identifier", "type", "createdAt");

-- Failed login attempts tracking
CREATE TABLE IF NOT EXISTS "FailedLoginAttempt" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedLoginAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FailedLoginAttempt_email_createdAt_idx" ON "FailedLoginAttempt"("email", "createdAt");
CREATE INDEX IF NOT EXISTS "FailedLoginAttempt_ipAddress_createdAt_idx" ON "FailedLoginAttempt"("ipAddress", "createdAt");

-- Account lockout table
CREATE TABLE IF NOT EXISTS "AccountLockout" (
    "email" TEXT NOT NULL,
    "lockedUntil" TIMESTAMP(3) NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountLockout_pkey" PRIMARY KEY ("email")
);

-- Security event logging
CREATE TABLE IF NOT EXISTS "SecurityEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "email" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SecurityEvent_type_createdAt_idx" ON "SecurityEvent"("type", "createdAt");
CREATE INDEX IF NOT EXISTS "SecurityEvent_email_createdAt_idx" ON "SecurityEvent"("email", "createdAt");
CREATE INDEX IF NOT EXISTS "SecurityEvent_ipAddress_createdAt_idx" ON "SecurityEvent"("ipAddress", "createdAt");

