# Security Improvements Implementation Guide

This guide walks you through implementing the security improvements for your authentication system.

## Step 1: Database Migration

Run the Prisma migration to add security tables:

```bash
# Generate Prisma client with new models
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_security_tables
```

Or manually run the SQL migration:

```bash
psql $DATABASE_URL -f prisma/migrations/security_tables.sql
```

## Step 2: Environment Variables

Add the following to your `.env` file:

```env
# Required for NextAuth session encryption
AUTH_SECRET=your-random-secret-key-here

# Generate a secure secret:
# openssl rand -base64 32
```

## Step 3: Update Dependencies

The security improvements use existing Prisma and Next.js features. No new dependencies are required.

## Step 4: Implementation Checklist

### ✅ Completed
- [x] Rate limiting utilities (`src/lib/security/rateLimit.ts`)
- [x] Account lockout system (`src/lib/security/accountLockout.ts`)
- [x] Security event logging (`src/lib/security/securityLogger.ts`)
- [x] Security headers middleware (`src/middlewares/securityHeaders.ts`)
- [x] Updated Prisma schema with security tables
- [x] Updated auth.ts with session security
- [x] Updated middleware with security headers

### 🔄 To Implement

1. **Update Sign-In Page** (`src/app/[locale]/auth/signin/page.tsx`)
   - Add account lockout check before submitting
   - Show lockout message if account is locked
   - Handle rate limit errors gracefully

2. **Integrate Rate Limiting in Sign-In Flow**
   - Add rate limit check in the sign-in handler
   - Return appropriate error messages

3. **Email Verification Enforcement**
   - Create email verification page
   - Redirect unverified users to verification page
   - Add resend verification email functionality

4. **Monitoring & Alerts**
   - Set up alerts for suspicious activity
   - Monitor security event logs
   - Create admin dashboard for security events

## Step 5: Testing

### Test Rate Limiting
```bash
# Test email rate limit (5 attempts per 15 minutes)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
done
```

### Test Account Lockout
```bash
# Make 5 failed attempts to trigger lockout
# 6th attempt should be blocked
```

### Test Security Headers
```bash
curl -I http://localhost:3000 | grep -i "x-content-type-options\|x-frame-options\|content-security-policy"
```

## Step 6: Production Considerations

1. **Rate Limiting**: Consider using Redis for distributed rate limiting in production
2. **Logging**: Set up log aggregation (e.g., Datadog, Sentry) for security events
3. **Monitoring**: Create dashboards for:
   - Failed login attempts
   - Rate limit violations
   - Account lockouts
   - Suspicious activity patterns

4. **Backup & Recovery**: Ensure security tables are included in backups

## Security Best Practices

1. **Regular Audits**: Review security event logs weekly
2. **Secret Rotation**: Rotate AUTH_SECRET periodically
3. **IP Whitelisting**: Consider IP whitelisting for admin accounts
4. **2FA**: Consider adding two-factor authentication for admin accounts
5. **Email Domain Validation**: Consider blocking disposable email domains

## Troubleshooting

### Rate Limit Not Working
- Check database connection
- Verify RateLimit table exists
- Check Prisma client is generated

### Account Lockout Not Working
- Verify FailedLoginAttempt and AccountLockout tables exist
- Check database indexes are created
- Review accountLockout.ts logic

### Security Headers Not Applied
- Verify middleware.ts is updated
- Check Next.js middleware configuration
- Ensure securityHeadersMiddleware is called

## Next Steps

1. Implement email verification enforcement
2. Add 2FA for admin accounts
3. Set up monitoring and alerting
4. Create admin security dashboard
5. Implement IP-based restrictions for sensitive operations

