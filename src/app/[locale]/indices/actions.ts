"use server";

import {getAssetsWithHistories} from "@/lib/db/helpers/db.helpers";
import {
    AssetHistory,
    Id,
    IndexOverview,
    IndexOverviewAsset,
    IndexOverviewWithHistory,
} from "@/utils/types/general.types";
import {pick, uniqBy} from "lodash";
import {unstable_cacheTag as cacheTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";
import {combineCacheTags} from "@/utils/cache/helpers.cache";
import moment from "moment/moment";
import {HISTORY_OVERVIEW_DAYS} from "@/utils/constants/general.constants";
import {
    dbGetAssetHistoryByIdAndStartTime,
    dbGetMultipleAssetHistoryByStartTime,
} from "@/lib/db/helpers/db.assetsHistory.helpers";
import {getIndexHistory} from "@/utils/heleprs/index/index.helpers";
import {dbGetIndexOverviewById} from "@/lib/db/helpers/db.indexOverview.helpers";

export const actionGetIndexHistory = async (id: Id, propIndexOverview?: IndexOverview) => {
    "use cache";
    cacheTag(CacheTag.INDICES_OVERVIEW, CacheTag.INDICES_HISTORY, combineCacheTags(CacheTag.INDICES_HISTORY, id));

    const indexOverview = propIndexOverview ?? (await dbGetIndexOverviewById(id));

    if (!indexOverview) {
        return [];
    }

    const {assets: assetsWithHistories} = await getAssetsWithHistories<IndexOverviewAsset>({
        assets: indexOverview.assets,
        startTime: moment()
            .utc()
            .startOf("d")
            .add(-HISTORY_OVERVIEW_DAYS - 1, "days")
            .valueOf(),
    });

    return getIndexHistory({...pick(indexOverview, ["id", "name", "startingBalance"]), assets: assetsWithHistories});
};

export const actionGetAssetHistory = async (assetId: string, startTime: number) => {
    "use cache";
    cacheTag(CacheTag.ASSETS_HISTORY, combineCacheTags(CacheTag.ASSETS_HISTORY, assetId, startTime));

    return dbGetAssetHistoryByIdAndStartTime(assetId, startTime);
};

export const actionGetAssetsWithHistory = async ({
    assets,
    startTime,
    endTime,
    normalizedAssetsHistory,
}: {
    assets: Pick<IndexOverviewAsset, "id">[];
    startTime?: number;
    endTime?: number;
    normalizedAssetsHistory?: Record<string, AssetHistory[]>;
}) => {
    "use cache";
    cacheTag(CacheTag.ASSETS_HISTORY);

    return await getAssetsWithHistories({
        assets,
        startTime,
        endTime,
        normalizedAssetsHistory,
    });
};

export const actionGetIndicesWithHistoryOverview = async (
    indices: IndexOverview[]
): Promise<IndexOverviewWithHistory[]> => {
    "use cache";
    cacheTag(CacheTag.INDICES_OVERVIEW);

    const allUsedAssets = indices
        .reduce((acc, index) => {
            return uniqBy([...acc, ...index.assets], "id");
        }, [] as IndexOverviewAsset[])
        .map(a => pick(a, ["id"]));

    const startTime = moment()
        .utc()
        .startOf("d")
        .add(-HISTORY_OVERVIEW_DAYS - 1, "days")
        .valueOf();

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

        const history = getIndexHistory({
            id: index.id,
            name: index.name,
            startingBalance: index.startingBalance,
            assets: indexAssetsWithHistoryAndOverview as any,
        });

        return {
            ...index,
            history,
        };
    });
};
