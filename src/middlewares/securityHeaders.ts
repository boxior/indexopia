import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

/**
 * Security headers middleware
 * Adds security headers to all responses
 */
export function securityHeadersMiddleware(request: NextRequest, response?: NextResponse) {
    const res = response || NextResponse.next();

    // Prevent XSS attacks
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-XSS-Protection", "1; mode=block");

    // Content Security Policy
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://www.google.com https://api.coincap.io",
        "frame-src 'self' https://www.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
    ].join("; ");

    res.headers.set("Content-Security-Policy", csp);

    // Referrer Policy
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions Policy (formerly Feature Policy)
    res.headers.set(
        "Permissions-Policy",
        "geolocation=(), microphone=(), camera=()"
    );

    // Strict Transport Security (only in production with HTTPS)
    if (process.env.NODE_ENV === "production") {
        res.headers.set(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains; preload"
        );
    }

    return res;
}

