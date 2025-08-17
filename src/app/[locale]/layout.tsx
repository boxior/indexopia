import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "../globals.css";
import {SessionProvider} from "next-auth/react";
import {auth} from "@/auth";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import {PageProps} from "@/utils/types/general.types";
import {NextIntlClientProvider, hasLocale} from "next-intl";
import {notFound} from "next/navigation";
import {routing} from "@/i18n/routing";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",

    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Indexopia",
    description: "Crypto indices",
};

export default async function RootLayout(props: Readonly<PageProps>) {
    // Ensure that the incoming `locale` is valid
    const {locale} = await props.params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale}>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <SuspenseWrapper>
                    <RootLayoutSuspended {...props} />
                </SuspenseWrapper>
            </body>
        </html>
    );
}

const RootLayoutSuspended = async ({children}: Readonly<PageProps>) => {
    const session = await auth();

    return (
        <SessionProvider session={session}>
            {<NextIntlClientProvider>{children}</NextIntlClientProvider>}
        </SessionProvider>
    );
};
