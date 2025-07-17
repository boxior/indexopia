"use server";

import * as React from "react";
import {dbGetIndicesOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {connection} from "next/server";
import {MOCK_USER_ID} from "@/utils/constants/general.constants";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import ContentLoader from "@/components/Suspense/ContentLoader";
import {ENV_VARIABLES} from "@/env";
import {auth} from "@/auth";
import Header from "@/app/components/Header";
import IndicesTable from "@/app/indices/components/CLAUD/IndicesTable";

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

    const systemIndicesOverview = await dbGetIndicesOverview();
    const userIndicesOverview = await dbGetIndicesOverview(MOCK_USER_ID);

    // const indices = [...systemIndicesOverview, ...userIndicesOverview];

    return <IndicesTable indices={[...systemIndicesOverview, ...userIndicesOverview]} userId={session?.user?.id} />;
};
