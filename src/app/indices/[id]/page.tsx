import {connection} from "next/server";
import {getIndex} from "@/lib/db/helpers/db.helpers";
import {IndexPageClient} from "@/app/indices/[id]/components/CLAUD_WEB/IndexPageClient";
import ContentLoader from "@/components/Suspense/ContentLoader";
import * as React from "react";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import fetchAssets from "@/app/actions/assets/fetchAssets";

interface PageProps {
    params: Promise<{id: string}>;
}

export default async function Page(pageProps: PageProps) {
    return (
        <SuspenseWrapper
            loadingMessage="Loading index details..."
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

    const {data: assets} = await fetchAssets({});

    return <IndexPageClient index={index} assets={assets} />;
};
