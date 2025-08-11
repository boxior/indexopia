"use server";

import * as React from "react";
import {dbGetIndicesOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {connection} from "next/server";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import ContentLoader from "@/components/Suspense/ContentLoader";
import fetchAssets from "@/app/actions/assets/fetchAssets";
import {IndexesPageClient} from "@/app/indices/components/CLAUD_WEB/IndicesPageClient";
import {auth} from "@/auth";
import {getAssetsWithHistories, getIndexHistory} from "@/lib/db/helpers/db.helpers";
import {IndexOverview, IndexOverviewAsset, IndexOverviewWithHistory} from "@/utils/types/general.types";
import moment from "moment";
import {HISTORY_OVERVIEW_DAYS} from "@/utils/constants/general.constants";
import {pick, uniqBy} from "lodash";
import {dbGetMultipleAssetHistoryByStartTime} from "@/lib/db/helpers/db.assetsHistory.helpers";

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
    const currentUserId = session?.user?.id;

    const fetchedIndices = await Promise.all([
        dbGetIndicesOverview(),
        currentUserId ? dbGetIndicesOverview(currentUserId) : [],
    ]);

    const indices = [...fetchedIndices[0], ...fetchedIndices[1]];
    const fetchedProps = await Promise.all([fetchAssets({}), getIndicesWithHistoryOverview(indices)]);

    return <IndexesPageClient assets={fetchedProps[0]} indices={fetchedProps[1]} />;
};

const getIndicesWithHistoryOverview = async (indices: IndexOverview[]): Promise<IndexOverviewWithHistory[]> => {
    const allUsedAssets = indices
        .reduce((acc, index) => {
            return uniqBy([...acc, ...index.assets], "id");
        }, [] as IndexOverviewAsset[])
        .map(a => pick(a, ["id"]));

    const startTime = moment().utc().startOf("d").add(-HISTORY_OVERVIEW_DAYS, "days").valueOf();
    const normalizedAssetsHistory = await dbGetMultipleAssetHistoryByStartTime(
        allUsedAssets.map(a => a.id),
        startTime
    );

    const {assets: allUsedAssetsWithHistories} = await getAssetsWithHistories({
        assets: allUsedAssets,
        startTime,
        normalizedAssetsHistory,
    });

    return indices.map(index => {
        const indexAssetsWithHistoryAndOverview = index.assets.map(a => {
            const usedAssetsWithHistory = allUsedAssetsWithHistories.find(usedAsset => usedAsset.id === a.id) ?? {};

            return {
                ...a,
                ...usedAssetsWithHistory,
            };
        });

        const indexHistory = getIndexHistory({
            id: index.id,
            name: index.name,
            assets: indexAssetsWithHistoryAndOverview as any,
        });

        return {
            ...index,
            history: indexHistory,
        };
    });
};
