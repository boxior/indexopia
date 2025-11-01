import type {Metadata} from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import {TooltipProvider} from "@/components/ui/tooltip";
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";

export default async function IndicesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SuspenseWrapper>
            <LayoutComponent children={children} />
        </SuspenseWrapper>
    );
}

const LayoutComponent = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="min-h-screen flex flex-col">
            <TooltipProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
            </TooltipProvider>
        </div>
    );
};

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
    const {locale} = await params;

    if (!hasLocale(routing.locales, locale)) {
        // Ensure 404 metadata doesn’t leak a wrong locale
        notFound();
    }

    const t = await getTranslations({locale, namespace: "seo"});

    const title = t("legalTitle");
    const description = t("legalDescription");

    return {
        title,
        description,
    };
}
