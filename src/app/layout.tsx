import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {SessionProvider} from "next-auth/react";
import {auth} from "@/auth";
import {SuspenseContainer} from "@/components/SuspenseContainer";

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

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <SuspenseContainer>
                    <RootLayoutSuspended children={children} />
                </SuspenseContainer>
            </body>
        </html>
    );
}

const RootLayoutSuspended = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await auth();

    return <SessionProvider session={session}>{children}</SessionProvider>;
};
