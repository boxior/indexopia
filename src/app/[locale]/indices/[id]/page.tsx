import {connection} from "next/server";
import {getIndex} from "@/lib/db/helpers/db.helpers";
import {IndexPageClient} from "@/app/[locale]/indices/[id]/components/CLAUD_WEB/IndexPageClient";
import ContentLoader from "@/components/Suspense/ContentLoader";
import * as React from "react";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import {dbGetAssets} from "@/lib/db/helpers/db.assets.helpers";
import {getTranslations} from "next-intl/server";

interface PageProps {
    params: Promise<{id: string}>;
}

export default async function Page(pageProps: PageProps) {
    const t = await getTranslations("common");

    return (
        <SuspenseWrapper
            loadingMessage={t("hello")}
            // loadingMessage="Loading index details..."
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
    const index = await getIndex({
        id,
    });

    const assets = await dbGetAssets();

    return <IndexPageClient index={index} assets={assets} />;
};
