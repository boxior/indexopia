import {prisma} from "@/prisma";

export enum SecurityEventType {
    SIGN_IN_ATTEMPT = "SIGN_IN_ATTEMPT",
    SIGN_IN_SUCCESS = "SIGN_IN_SUCCESS",
    SIGN_IN_FAILED = "SIGN_IN_FAILED",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
    EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
    SESSION_CREATED = "SESSION_CREATED",
    SESSION_REVOKED = "SESSION_REVOKED",
}

export interface SecurityEventData {
    type: SecurityEventType;
    email?: string;
    ipAddress: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Log security events for monitoring and analysis
 */
export async function logSecurityEvent(data: SecurityEventData): Promise<void> {
    try {
        await prisma.securityEvent.create({
            data: {
                type: data.type,
                email: data.email,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            },
        });
    } catch (error) {
        // Don't fail the request if logging fails, but log to console
        console.error("Failed to log security event:", error);
    }
}

/**
 * Check for suspicious patterns
 */
export async function detectSuspiciousActivity(
    email: string,
    ipAddress: string
): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check for multiple failed attempts from different IPs
    const failedAttempts = await prisma.securityEvent.count({
        where: {
            email,
            type: SecurityEventType.SIGN_IN_FAILED,
            createdAt: {
                gte: oneHourAgo,
            },
        },
    });

    // Check for multiple IPs trying same email
    const uniqueIPs = await prisma.securityEvent.findMany({
        where: {
            email,
            type: SecurityEventType.SIGN_IN_ATTEMPT,
            createdAt: {
                gte: oneHourAgo,
            },
        },
        distinct: ["ipAddress"],
    });

    // Suspicious if: >10 failed attempts OR >3 different IPs
    if (failedAttempts > 10 || uniqueIPs.length > 3) {
        await logSecurityEvent({
            type: SecurityEventType.SUSPICIOUS_ACTIVITY,
            email,
            ipAddress,
            metadata: {
                failedAttempts,
                uniqueIPs: uniqueIPs.length,
            },
        });
        return true;
    }

    return false;
}

