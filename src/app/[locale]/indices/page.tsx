import * as React from "react";
import {dbGetIndicesOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {connection} from "next/server";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import ContentLoader from "@/components/Suspense/ContentLoader";
import {IndexesPageClient} from "@/app/[locale]/indices/components/CLAUD_WEB/IndicesPageClient";
import {auth} from "@/auth";
import {dbGetAssets} from "@/lib/db/helpers/db.assets.helpers";
import {actionGetIndicesWithHistoryOverview} from "@/app/[locale]/indices/actions";
import {getTranslations} from "next-intl/server";
import {IndexOverview} from "@/utils/types/general.types";
import moment from "moment";
import {actionUpdateIndexOverview} from "@/app/[locale]/indices/[id]/actions";
import {chunk, flatten} from "lodash";

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
    console.time("connection");

    await connection();
    console.timeEnd("connection");

    console.time("auth");
    const session = await auth();
    console.timeEnd("auth");

    const currentUserId = session?.user?.id;

    console.time("fetchedIndices");

    const fetchedIndices = await Promise.all([
        dbGetIndicesOverview(),
        currentUserId ? dbGetIndicesOverview(currentUserId) : [],
    ]);
    console.timeEnd("fetchedIndices");

    const systemIndices = fetchedIndices[0];
    const userIndices = await handleUpdateUserIndicesToUpToDateHistory(fetchedIndices[1]);
    // const userIndices = fetchedIndices[1];

    const indices = [...systemIndices, ...userIndices];
    console.time("fetchedProps");

    const fetchedProps = await Promise.all([dbGetAssets(), actionGetIndicesWithHistoryOverview(indices)]);
    console.timeEnd("fetchedProps");

    return <IndexesPageClient assets={fetchedProps[0]} indices={fetchedProps[1]} />;
};

/**
 * This function will update the user indices to up-to-date history.
 */
const handleUpdateUserIndicesToUpToDateHistory = async (indices: IndexOverview[]) => {
    const upToDateStartOfTheDay = moment().utc().add(-1, "day").startOf("day").valueOf();

    const chunks = chunk(indices, 10);

    const upToDateIndices: IndexOverview[] = flatten(
        await Promise.all(
            chunks.map(ch =>
                Promise.all(
                    ch.map(async indexOverview => {
                        if (!!indexOverview.endTime && indexOverview.endTime < upToDateStartOfTheDay) {
                            // update index overview
                            return (await actionUpdateIndexOverview(indexOverview, false)) ?? indexOverview;
                        }

                        return indexOverview;
                    })
                )
            )
        )
    );

    return upToDateIndices;
};
