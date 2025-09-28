import {connection} from "next/server";
import {IndexPageClient} from "@/app/[locale]/indices/[id]/components/CLAUD_WEB/IndexPageClient";
import ContentLoader from "@/components/Suspense/ContentLoader";
import * as React from "react";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import {getTranslations} from "next-intl/server";
import type {Metadata} from "next";
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";
import {notFound} from "next/navigation";
import {dbGetIndexOverviewById} from "@/lib/db/helpers/db.indexOverview.helpers";

interface PageProps {
    params: Promise<{id: string}>;
}

export default async function Page(pageProps: PageProps) {
    const t = await getTranslations("index");

    return (
        <SuspenseWrapper
            loadingMessage={t("loading")}
            variant="pulse"
            showLogo={false}
            fullScreen={false}
            fallback={
                <div className="container mx-auto px-4 py-8 space-y-8">
                    <ContentLoader type="card" count={1} />
                    <ContentLoader type="chart" count={1} />
                    <ContentLoader type="table" count={3} />
                </div>
            }
        >
            <IndexPageComponent {...pageProps} />
        </SuspenseWrapper>
    );
}

const IndexPageComponent = async ({params}: PageProps) => {
    await connection();

    const {id} = await params;

    const indexOverview = await dbGetIndexOverviewById(id);

    return <IndexPageClient index={indexOverview} />;
};

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
    const {locale} = await params;

    if (!hasLocale(routing.locales, locale)) {
        // Ensure 404 metadata doesn’t leak a wrong locale
        notFound();
    }

    const t = await getTranslations({locale, namespace: "seo"});

    const title = t("indexTitle");
    const description = t("indexDescription");

    return {
        title,
        description,
    };
}
