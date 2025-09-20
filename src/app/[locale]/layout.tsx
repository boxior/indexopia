import type {Metadata, Viewport} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "../globals.css";
import {SessionProvider} from "next-auth/react";
import {auth} from "@/auth";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import {PageProps} from "@/utils/types/general.types";
import {NextIntlClientProvider, hasLocale} from "next-intl";
import {notFound} from "next/navigation";
import {routing} from "@/i18n/routing";
import {getTranslations} from "next-intl/server";
import {ENV_VARIABLES} from "@/env";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default async function RootLayout(props: Readonly<PageProps>) {
    // Ensure that the incoming `locale` is valid
    const {locale} = await props.params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale}>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <NextIntlClientProvider>
                    <SuspenseWrapper>
                        <RootLayoutSuspended {...props} />
                    </SuspenseWrapper>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

const RootLayoutSuspended = async ({children}: Readonly<PageProps>) => {
    const session = await auth();

    return <SessionProvider session={session}>{children}</SessionProvider>;
};

// Add locale-aware SEO using Next Metadata best practices
// export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
//     const {locale} = await params;
//
//     if (!hasLocale(routing.locales, locale)) {
//         // Ensure 404 metadata doesn’t leak a wrong locale
//         notFound();
//     }
//
//     const t = await getTranslations({locale, namespace: "seo"});
//
//     // Configure host from env, fallback to localhost in dev
//     const siteUrl = ENV_VARIABLES.NEXT_PUBLIC_SITE_URL;
//
//     const siteName = t("siteName");
//     const defaultTitle = t("defaultTitle");
//     const defaultDescription = t("defaultDescription");
//
//     // Map locales to hrefs for alternates/hreflang
//     const languages: Record<string, string> = {};
//     for (const l of routing.locales) {
//         languages[l] = `${siteUrl}/${l}`;
//     }
//
//     const isProd = process.env.NODE_ENV === "production";
//     const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";
//
//     return {
//         metadataBase: new URL(siteUrl),
//         // Title strategy: per-page titles will use this template
//         title: {
//             default: defaultTitle,
//             template: `%s | ${siteName}`,
//         },
//         description: defaultDescription,
//         applicationName: siteName,
//         // Canonical per-locale homepage
//         alternates: {
//             canonical: `${siteUrl}/${locale}`,
//             languages,
//         },
//         openGraph: {
//             title: defaultTitle,
//             description: defaultDescription,
//             url: `${siteUrl}/${locale}`,
//             siteName,
//             locale,
//             type: "website",
//             images: [
//                 {
//                     url: "/og-image.png", // Ensure this file exists under /public
//                     width: 1200,
//                     height: 630,
//                     alt: siteName,
//                 },
//             ],
//         },
//         twitter: {
//             card: "summary_large_image",
//             title: defaultTitle,
//             description: defaultDescription,
//             creator: "@indexopia", // update if you have a real handle
//             images: ["/og-image.png"],
//         },
//         robots: {
//             // Block if preview or explicitly marked non-production
//             index: isProd && !isPreview,
//             follow: isProd && !isPreview,
//             googleBot: {
//                 index: isProd && !isPreview,
//                 follow: isProd && !isPreview,
//                 "max-image-preview": "large",
//                 "max-snippet": -1,
//                 "max-video-preview": -1,
//             },
//         },
//         manifest: "/site.webmanifest",
//         category: "Finance",
//         keywords: [
//             "crypto indices",
//             "crypto index",
//             "cryptocurrency index",
//             "digital asset index",
//             "bitcoin index",
//             "ethereum index",
//             "indexopia",
//         ],
//         // Optional: supply icons if you have them in /public
//         icons: {
//             icon: "/favicon.ico",
//             apple: "/apple-touch-icon.png",
//             shortcut: "/favicon-32x32.png",
//         },
//     };
// }

// Improve mobile SEO & theming (optional but recommended)
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    colorScheme: "light dark",
    themeColor: [
        {media: "(prefers-color-scheme: light)", color: "#ffffff"},
        {media: "(prefers-color-scheme: dark)", color: "#0b0b0f"},
    ],
};
