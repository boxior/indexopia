import NextAuth from "next-auth";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {prisma} from "@/prisma";
import Resend from "next-auth/providers/resend";
import {ENV_VARIABLES} from "@/env";
import {Resend as ResendClass} from "resend";
import {getTranslations} from "next-intl/server";
import {
    BRAND_NAME,
    DEFAULT_LOCALE,
    DOMAIN_NAME,
    PAGES_URLS,
    SUPPORTED_LOCALES,
} from "@/utils/constants/general.constants";

const resend = new ResendClass(ENV_VARIABLES.AUTH_RESEND_KEY);

export const {handlers, auth} = NextAuth({
    adapter: PrismaAdapter(prisma),
    trustHost: true, // Allows localhost:3000 and localhost:3001 in development
    providers: [
        Resend({
            // If your environment variable is named differently than default
            apiKey: ENV_VARIABLES.AUTH_RESEND_KEY,
            from: `${BRAND_NAME} <noreply@${DOMAIN_NAME}.com>`,
            async sendVerificationRequest({identifier: email, url, request}) {
                // Extract locale from the request or URL
                const locale = extractLocaleFromRequest(request, url);

                const t = await getTranslations({locale, namespace: "email.signin"});

                await resend.emails.send({
                    from: `${BRAND_NAME} <noreply@${DOMAIN_NAME}.com>`,
                    to: email,
                    subject: t("subject"), // e.g., "Access Your Crypto Portfolio Dashboard"
                    html: `
        <!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t("subject")}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Compact Header -->
    <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 25px 20px; text-align: center;">
        <table style="width: 100%; margin-bottom: 15px;">
            <tr>
                <td style="text-align: left; vertical-align: middle;">
                    <div style="display: inline-block; vertical-align: middle;">
                        <div style="width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); display: inline-block; vertical-align: middle; margin-right: 10px; position: relative; text-align: center;">
                            <span style="color: white; font-weight: bold; font-size: 18px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;  line-height: 40px;">IX</span>
                        </div>
                        <span style="color: white; font-size: 24px; line-height: 40px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1); vertical-align: middle; display: inline-block;">${BRAND_NAME}</span>
                    </div>
                </td>
            </tr>
        </table>
        <h1 style="color: white; font-size: 22px; font-weight: 600; margin: 0;">
            ${t("tagline")}
        </h1>
    </div>

    <!-- Minimal Content -->
    <div style="padding: 25px 20px;">
        <div style="text-align: center; margin-bottom: 25px;">
            <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin: 0 0 20px;">
                ${t("signInContext")}
            </p>

            <!-- Sign-in Button - Prominent -->
            <a href="${url}"
               style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); margin: 10px 0;">
                ${t("signInButton")}
            </a>
        </div>

        <!-- Minimal Details -->
        <div style="background-color: #f8fafc; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
                <strong style="color: #374151;">${t("emailAddress")}:</strong> ${email}
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 5px 0 0;">
                <strong style="color: #374151;">${t("requestedAt")}:</strong> ${new Date().toLocaleString(locale, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </p>
        </div>

        <!-- Security & Footer -->
        <div style="text-align: center; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                ${t("securityNote")} ${t("ignoreEmail")}
            </p>
        </div>
    </div>
</div>

<!-- Mobile Optimization -->
<style>
    @media only screen and (max-width: 600px) {
        .container {
            width: 100% !important;
            margin: 10px !important;
            border-radius: 8px !important;
        }
        .content {
            padding: 20px 15px !important;
        }
        .header {
            padding: 20px 15px !important;
        }
        .button {
            padding: 14px 30px !important;
            font-size: 15px !important;
            width: auto !important;
        }
        h1 {
            font-size: 20px !important;
        }
        .details {
            padding: 12px !important;
            font-size: 12px !important;
        }
    }
</style>
</body>
</html>

        `,
                });
            },
        }),
    ],
    pages: {
        signIn: PAGES_URLS.authSignIn,
        error: PAGES_URLS.authError,
        verifyRequest: PAGES_URLS.authVerifyRequest,
    },
    callbacks: {
        async session({session, user}) {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
});

// Helper function to extract locale from request
function extractLocaleFromRequest(request?: Request, url?: string): string {
    // Method 1: From URL pathname (for localized routes)
    if (url) {
        const urlObj = new URL(url);
        const pathSegments = urlObj.pathname.split("/");
        const possibleLocale = pathSegments[1];

        // Check if it's a valid locale
        if (SUPPORTED_LOCALES.includes(possibleLocale)) {
            return possibleLocale;
        }
    }

    // Method 2: From next-intl cookie (NEXT_LOCALE)
    if (request) {
        const cookies = request.headers.get("cookie");
        if (cookies) {
            const localeMatch = cookies.match(/NEXT_LOCALE=([^;]+)/);
            if (localeMatch) {
                return localeMatch[1];
            }
        }
    }

    // Method 3: From Accept-Language header
    if (request) {
        const acceptLanguage = request.headers.get("accept-language");
        if (acceptLanguage) {
            const preferredLanguage = acceptLanguage.split(",")[0].split("-")[0];
            if (SUPPORTED_LOCALES.includes(preferredLanguage)) {
                return preferredLanguage;
            }
        }
    }

    // Default to English
    return DEFAULT_LOCALE;
}
