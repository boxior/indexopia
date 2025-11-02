import * as React from "react";
import {dbGetIndicesOverview, handleUpdateIndicesToUpToDateHistory} from "@/lib/db/helpers/db.indexOverview.helpers";
import {connection} from "next/server";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import ContentLoader from "@/components/Suspense/ContentLoader";
import {IndicesPageClient} from "@/app/[locale]/indices/components/CLAUD_WEB/IndicesPageClient";
import {auth} from "@/auth";
import {getTranslations} from "next-intl/server";

export default async function IndicesPage() {
    const t = await getTranslations("indices");

    return (
        <SuspenseWrapper
            loadingMessage={t("loading")}
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

    const currentUserId = session?.user?.id;

    const fetchedIndices = await Promise.all([
        dbGetIndicesOverview(),
        currentUserId ? dbGetIndicesOverview(currentUserId) : [],
    ]);

    const systemIndices = fetchedIndices[0];
    const userIndices = await handleUpdateIndicesToUpToDateHistory(fetchedIndices[1]);

    const indices = [...systemIndices, ...userIndices];

    return <IndicesPageClient indices={indices} />;
};
