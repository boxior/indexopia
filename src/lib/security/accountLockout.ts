import {prisma} from "@/prisma";

export interface LockoutResult {
    isLocked: boolean;
    lockoutUntil?: Date;
    attemptsRemaining: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if account is locked due to failed attempts
 */
export async function checkAccountLockout(email: string): Promise<LockoutResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - ATTEMPT_WINDOW_MS);

    // Get recent failed attempts
    const recentAttempts = await prisma.failedLoginAttempt.findMany({
        where: {
            email,
            createdAt: {
                gte: windowStart,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Check if account is currently locked
    const lockoutRecord = await prisma.accountLockout.findFirst({
        where: {
            email,
            lockedUntil: {
                gt: now,
            },
        },
    });

    if (lockoutRecord) {
        return {
            isLocked: true,
            lockoutUntil: lockoutRecord.lockedUntil,
            attemptsRemaining: 0,
        };
    }

    const attemptsRemaining = Math.max(0, MAX_FAILED_ATTEMPTS - recentAttempts.length);

    return {
        isLocked: false,
        attemptsRemaining,
    };
}

/**
 * Record a failed login attempt
 */
export async function recordFailedAttempt(
    email: string,
    ipAddress: string
): Promise<LockoutResult> {
    const now = new Date();

    // Record the attempt
    await prisma.failedLoginAttempt.create({
        data: {
            email,
            ipAddress,
        },
    });

    // Check if we should lock the account
    const lockoutCheck = await checkAccountLockout(email);

    if (lockoutCheck.attemptsRemaining === 0 && !lockoutCheck.isLocked) {
        // Lock the account
        const lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS);

        await prisma.accountLockout.upsert({
            where: {email},
            create: {
                email,
                lockedUntil,
                lockedAt: now,
            },
            update: {
                lockedUntil,
                lockedAt: now,
            },
        });

        return {
            isLocked: true,
            lockoutUntil: lockedUntil,
            attemptsRemaining: 0,
        };
    }

    return lockoutCheck;
}

/**
 * Clear failed attempts on successful login
 */
export async function clearFailedAttempts(email: string): Promise<void> {
    const windowStart = new Date(Date.now() - ATTEMPT_WINDOW_MS);

    await prisma.failedLoginAttempt.deleteMany({
        where: {
            email,
            createdAt: {
                gte: windowStart,
            },
        },
    });

    // Remove lockout if exists
    await prisma.accountLockout.deleteMany({
        where: {
            email,
        },
    });
}

