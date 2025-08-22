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
                    subject: t("subject"),
                    html: `
                    <h2>${t("welcome")}</h2>
                    <p>${t("clickLink")}</p>
                    <a href="${url}" style="background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      ${t("signInButton")}
                    </a>
                    <p>${t("ignoreEmail")}</p>
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
