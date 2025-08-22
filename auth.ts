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
    providers: [
        Resend({
            // If your environment variable is named differently than default
            apiKey: ENV_VARIABLES.AUTH_RESEND_KEY,
            from: `no-reply@${DOMAIN_NAME}.com`,
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
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${t("subject")}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <!-- Header with gradient -->
                <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
                    <!-- Logo -->
                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 25px;">
                        <div style="width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);  margin-right: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                            <span style="color: white; font-weight: bold; font-size: 18px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 40px;   width: 100%; height: 100%; text-align: center;">IX</span>
                        </div>
                        <span style="color: white; font-size: 24px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${BRAND_NAME}</span>
                    </div>
                    
                    <h1 style="color: white; font-size: 28px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        ${t("welcome")}
                    </h1>
                    <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 10px 0 0; font-weight: 300;">
                        ${t("tagline")} <!-- e.g., "Your Gateway to Professional Crypto Indices" -->
                    </p>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 15px;">
                            ${t("signInTitle")} <!-- e.g., "Secure Sign-in Request" -->
                        </h2>
                        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 15px;">
                            ${t("signInContext")} <!-- e.g., "We received a sign-in request for your account. This secure, passwordless authentication ensures your crypto data stays protected." -->
                        </p>
                        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0;">
                            ${t("clickLink")} <!-- e.g., "Click the button below to access your dashboard and continue managing your crypto indices." -->
                        </p>
                    </div>

                    <!-- Device/Location info -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 10px;">
                            ${t("signInDetails")} <!-- e.g., "Sign-in Details:" -->
                        </h3>
                        <div style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                            <div style="margin-bottom: 5px;">
                                <strong style="color: #374151;">${t("requestedAt")}:</strong> ${new Date().toLocaleString(
                                    locale,
                                    {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }
                                )}
                            </div>
                            <div style="margin-bottom: 5px;">
                                <strong style="color: #374151;">${t("emailAddress")}:</strong> ${email}
                            </div>
                            <div>
                                <strong style="color: #374151;">${t("purpose")}:</strong> ${t("purposeText")} <!-- e.g., "Dashboard access & portfolio management" -->
                            </div>
                        </div>
                    </div>

                    <!-- Features preview -->
                    <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                        <div style="display: flex; align-items: center; margin-bottom: 15px;">
                            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                    <path d="M3 13l4 4L18 6"/>
                                </svg>
                            </div>
                            <span style="color: #374151; font-weight: 600; font-size: 16px;">
                                ${t("featuresTitle")} <!-- e.g., "What's waiting for you:" -->
                            </span>
                        </div>
                        <ul style="margin: 0; padding: 0; list-style: none;">
                            <li style="color: #4b5563; margin: 8px 0; padding-left: 20px; position: relative;">
                                <span style="position: absolute; left: 0; color: #3b82f6;">•</span>
                                ${t("feature1")} <!-- e.g., "Real-time crypto index performance tracking" -->
                            </li>
                            <li style="color: #4b5563; margin: 8px 0; padding-left: 20px; position: relative;">
                                <span style="position: absolute; left: 0; color: #3b82f6;">•</span>
                                ${t("feature2")} <!-- e.g., "Professional analytics and risk metrics" -->
                            </li>
                            <li style="color: #4b5563; margin: 8px 0; padding-left: 20px; position: relative;">
                                <span style="position: absolute; left: 0; color: #3b82f6;">•</span>
                                ${t("feature3")} <!-- e.g., "Custom portfolio creation and management" -->
                            </li>
                        </ul>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${url}" 
                           style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); transition: all 0.2s ease;">
                            ${t("signInButton")} <!-- e.g., "Access My Dashboard" -->
                        </a>
                    </div>

                    <!-- Security note -->
                    <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 25px 0;">
                        <div style="display: flex; align-items: flex-start;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" style="margin-right: 10px; margin-top: 2px; flex-shrink: 0;">
                                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                            </svg>
                            <div>
                                <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">
                                    ${t("securityTitle")} <!-- e.g., "Security First" -->
                                </p>
                                <p style="color: #92400e; margin: 5px 0 0; font-size: 14px;">
                                    ${t("securityNote")} <!-- e.g., "This link will expire in 24 hours for your security." -->
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Footer text -->
                    <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 14px; margin: 0;">
                            ${t("ignoreEmail")} <!-- e.g., "If you didn't request this email, you can safely ignore it." -->
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0;">
                            ${t("footer")} <!-- e.g., "© 2025 CryptoIndices. Professional crypto portfolio management." -->
                        </p>
                    </div>
                </div>
            </div>

            <!-- Email client compatibility styles -->
            <style>
                @media only screen and (max-width: 600px) {
                    .container { width: 100% !important; margin: 0 !important; }
                    .content { padding: 20px !important; }
                    .button { padding: 14px 24px !important; font-size: 14px !important; }
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
