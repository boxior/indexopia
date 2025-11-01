import type {Metadata} from "next";
import {auth} from "@/auth";
import {PAGES_URLS} from "@/utils/constants/general.constants";
import {notFound, redirect} from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import {TooltipProvider} from "@/components/ui/tooltip";
import {getTranslations} from "next-intl/server";
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";

export default async function IndicesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SuspenseWrapper>
            <IndicesLayoutComponent children={children} />
        </SuspenseWrapper>
    );
}

const IndicesLayoutComponent = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await auth();

    if (!session) {
        return redirect(PAGES_URLS.authSignIn);
    }

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

    const title = t("indicesTitle");
    const description = t("indicesDescription");

    return {
        title,
        description,
    };
}
