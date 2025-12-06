import {NextRequest, NextResponse} from "next/server";
import {signIn} from "next-auth/react";
import {checkRateLimit, getClientIP, RATE_LIMIT_CONFIG} from "@/lib/security/rateLimit";
import {checkAccountLockout, recordFailedAttempt, clearFailedAttempts} from "@/lib/security/accountLockout";
import {logSecurityEvent, SecurityEventType, detectSuspiciousActivity} from "@/lib/security/securityLogger";

/**
 * Enhanced sign-in API route with rate limiting and security checks
 * This wraps the NextAuth sign-in to add additional security layers
 */
export async function POST(req: NextRequest) {
    try {
        const {email} = await req.json();
        const ipAddress = getClientIP(req);
        const userAgent = req.headers.get("user-agent") || undefined;

        // Validate email format
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                {error: "Invalid email format" },
                {status: 400}
            );
        }

        // Log sign-in attempt
        await logSecurityEvent({
            type: SecurityEventType.SIGN_IN_ATTEMPT,
            email,
            ipAddress,
            userAgent,
        });

        // Check account lockout
        const lockoutCheck = await checkAccountLockout(email);
        if (lockoutCheck.isLocked) {
            await logSecurityEvent({
                type: SecurityEventType.ACCOUNT_LOCKED,
                email,
                ipAddress,
                userAgent,
                metadata: {
                    lockedUntil: lockoutCheck.lockoutUntil,
                },
            });

            // Generic error message to prevent account enumeration
            return NextResponse.json(
                {error: "Too many attempts. Please try again later." },
                {status: 429}
            );
        }

        // Rate limiting per email
        const emailRateLimit = await checkRateLimit({
            ...RATE_LIMIT_CONFIG.SIGN_IN_EMAIL,
            identifier: email,
            type: "email",
        });

        if (!emailRateLimit.allowed) {
            await logSecurityEvent({
                type: SecurityEventType.RATE_LIMIT_EXCEEDED,
                email,
                ipAddress,
                userAgent,
                metadata: {
                    limitType: "email",
                    resetAt: emailRateLimit.resetAt,
                },
            });

            return NextResponse.json(
                {error: "Too many attempts. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": Math.ceil(
                            (emailRateLimit.resetAt.getTime() - Date.now()) / 1000
                        ).toString(),
                    },
                }
            );
        }

        // Rate limiting per IP
        const ipRateLimit = await checkRateLimit({
            ...RATE_LIMIT_CONFIG.SIGN_IN_IP,
            identifier: ipAddress,
            type: "ip",
        });

        if (!ipRateLimit.allowed) {
            await logSecurityEvent({
                type: SecurityEventType.RATE_LIMIT_EXCEEDED,
                email,
                ipAddress,
                userAgent,
                metadata: {
                    limitType: "ip",
                    resetAt: ipRateLimit.resetAt,
                },
            });

            return NextResponse.json(
                {error: "Too many attempts. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": Math.ceil(
                            (ipRateLimit.resetAt.getTime() - Date.now()) / 1000
                        ).toString(),
                    },
                }
            );
        }

        // Check for suspicious activity
        const isSuspicious = await detectSuspiciousActivity(email, ipAddress);
        if (isSuspicious) {
            // Still allow, but log for monitoring
            // You might want to add additional verification (e.g., CAPTCHA) here
        }

        // Proceed with NextAuth sign-in
        // Note: This is a simplified version. In practice, you'd call NextAuth's signIn
        // The actual sign-in happens through NextAuth's handlers
        // This route serves as a security wrapper

        return NextResponse.json({success: true });
    } catch (error) {
        console.error("Sign-in error:", error);
        return NextResponse.json(
            {error: "An error occurred. Please try again." },
            {status: 500}
        );
    }
}

