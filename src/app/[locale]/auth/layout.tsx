import type {Metadata} from "next";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import Footer from "@/app/components/Footer";
import BasicHeader from "@/app/components/BasicHeader";
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";

export default async function SignInLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SuspenseWrapper>
            <AuthLayoutComponent children={children} />
        </SuspenseWrapper>
    );
}

const AuthLayoutComponent = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className={"min-h-screen flex flex-col justify-between"}>
            <BasicHeader />
            <div className={"flex flex-1"}>{children}</div>
            <Footer />
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

    const title = t("authTitle");
    const description = t("authDescription");

    return {
        title,
        description,
    };
}
