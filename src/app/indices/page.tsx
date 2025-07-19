"use server";

import * as React from "react";
import {dbGetIndicesOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {connection} from "next/server";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import ContentLoader from "@/components/Suspense/ContentLoader";
import fetchAssets from "@/app/actions/assets/fetchAssets";
import {IndexesPageClient} from "@/app/indices/IndicesPageClient";
import {auth} from "@/auth";

export default async function IndicesPage() {
    return (
        <SuspenseWrapper
            loadingMessage="Loading crypto indices..."
            variant="dots"
            showLogo={false}
            fullScreen={false}
            fallback={
                <div className="container mx-auto px-4 py-8">
                    <ContentLoader type="table" count={5} />
                </div>
            }
        >
            <IndicesPageComponent />
        </SuspenseWrapper>
    );
}

const IndicesPageComponent = async () => {
    await connection();

    const session = await auth();
    const userId = session?.user?.id;

    const systemIndicesOverview = await dbGetIndicesOverview();
    const userIndicesOverview = userId ? await dbGetIndicesOverview(userId) : [];

    const {data: assets} = await fetchAssets({});

    return <IndexesPageClient data={[...systemIndicesOverview, ...userIndicesOverview]} assets={assets} />;
};
