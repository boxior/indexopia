import {prisma} from "@/prisma";

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}

export interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;
    identifier: string; // email or IP
    type: "email" | "ip";
}

/**
 * Rate limiting using database for distributed systems
 * Tracks attempts in PostgreSQL with automatic cleanup
 */
export async function checkRateLimit(
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowMs);

    // Clean up old entries (older than window)
    await prisma.$executeRaw`
        DELETE FROM "RateLimit"
        WHERE "createdAt" < ${windowStart}
    `;

    // Count attempts in current window
    const attempts = await prisma.rateLimit.count({
        where: {
            identifier: config.identifier,
            type: config.type,
            createdAt: {
                gte: windowStart,
            },
        },
    });

    const remaining = Math.max(0, config.maxAttempts - attempts);
    const allowed = remaining > 0;

    if (allowed) {
        // Record this attempt
        await prisma.rateLimit.create({
            data: {
                identifier: config.identifier,
                type: config.type,
            },
        });
    }

    const resetAt = new Date(now.getTime() + config.windowMs);

    return {
        allowed,
        remaining,
        resetAt,
    };
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
    // Check various headers for IP (behind proxy/load balancer)
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    const realIP = request.headers.get("x-real-ip");
    if (realIP) {
        return realIP;
    }

    // Fallback (shouldn't happen in production)
    return "unknown";
}

/**
 * Rate limit configuration constants
 */
export const RATE_LIMIT_CONFIG = {
    SIGN_IN_EMAIL: {
        maxAttempts: 5, // 5 attempts per email
        windowMs: 15 * 60 * 1000, // 15 minutes
    },
    SIGN_IN_IP: {
        maxAttempts: 10, // 10 attempts per IP
        windowMs: 15 * 60 * 1000, // 15 minutes
    },
    RECAPTCHA_VERIFY: {
        maxAttempts: 20, // 20 verifications per IP
        windowMs: 60 * 60 * 1000, // 1 hour
    },
} as const;

