"use server";

import {AssetWithHistoryOverviewPortionAndMaxDrawDown, Id, Index, IndexOverview} from "@/utils/types/general.types";
import {filterAssets, getAssetsWithHistories, getHistoryOverview} from "@/lib/db/helpers/db.helpers";
import {getMaxDrawDownWithTimeRange} from "@/utils/heleprs/generators/drawdown/sortLessDrawDownIndexAssets.helper";
import {
    dbDeleteIndexOverview,
    dbGetIndexOverviewById,
    dbPostIndexOverview,
    dbPutIndexOverview,
} from "@/lib/db/helpers/db.indexOverview.helpers";
import {getIndexHistory} from "@/utils/heleprs/index/index.helpers";
import {unstable_cacheTag as cacheTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";
import {dbGetAssets, dbGetAssetsByIds} from "@/lib/db/helpers/db.assets.helpers";
import {combineCacheTags} from "@/utils/cache/helpers.cache";

export const actionUpdateIndexOverview = async (indexOverview: IndexOverview, revalidateTags?: boolean) => {
    let assets = [];

    const {
        assets: assetsWithHistories,
        startTime,
        endTime,
    } = await getAssetsWithHistories({
        assets: indexOverview.assets,
    });

    assets = assetsWithHistories;

    assets = assets.map(asset => ({
        ...asset,
        portion: indexOverview.assets.find(a => a.id === asset.id)?.portion ?? 0,
        maxDrawDown: getMaxDrawDownWithTimeRange(asset.history),
    }));

    const index = {
        name: indexOverview.name,
        startingBalance: indexOverview.startingBalance,
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
    };

    const history = getIndexHistory(index);
    const historyOverview = getHistoryOverview(history);
    const maxDrawDown = getMaxDrawDownWithTimeRange(history);

    return await dbPutIndexOverview(
        {...indexOverview, historyOverview, maxDrawDown, startTime, endTime},
        revalidateTags
    );
};

export const actionCreateIndexOverview = async ({
    name,
    startingBalance,
    assets: propAssets,
    userId,
    systemId,
}: Pick<IndexOverview, "name" | "assets" | "userId" | "systemId" | "startingBalance">) => {
    let assets = [];

    const {
        assets: assetsWithHistories,
        startTime,
        endTime,
    } = await getAssetsWithHistories({
        assets: propAssets,
    });

    assets = assetsWithHistories;

    assets = assets.map(asset => ({
        ...asset,
        portion: propAssets.find(a => a.id === asset.id)?.portion ?? 0,
        maxDrawDown: getMaxDrawDownWithTimeRange(asset.history),
    }));

    const index = {
        name,
        startingBalance,
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
    };

    const history = getIndexHistory(index);
    const historyOverview = getHistoryOverview(history);
    const maxDrawDown = getMaxDrawDownWithTimeRange(history);

    return await dbPostIndexOverview({
        name,
        assets,
        historyOverview,
        maxDrawDown,
        startTime,
        endTime,
        userId,
        systemId,
        startingBalance,
    });
};

export const actionDeleteIndexOverview = async (id: Id) => {
    await dbDeleteIndexOverview(id);
};

export const actionGetAssets = async (limit?: number | undefined) => {
    "use cache";
    cacheTag(CacheTag.ASSETS);

    const assets = await dbGetAssets();
    return filterAssets(assets, limit);
};

export const actionGetIndex = async ({
    id,
    startTime: propStartTime,
    indexOverview: propIndexOverview,
}: {
    id: Id;
    indexOverview?: IndexOverview;
    startTime?: number;
}): Promise<Index<AssetWithHistoryOverviewPortionAndMaxDrawDown> | null> => {
    "use cache";
    cacheTag(CacheTag.INDICES_OVERVIEW, combineCacheTags(CacheTag.INDICES_OVERVIEW, id));

    const indexOverview = propIndexOverview ?? (await dbGetIndexOverviewById(id));

    if (!indexOverview) {
        return null;
    }

    let assets = await dbGetAssetsByIds(indexOverview.assets.map(asset => asset.id));

    const startTimeToUse = propStartTime ?? indexOverview.startTime;

    const {
        assets: assetsWithHistories,
        startTime,
        endTime,
    } = await getAssetsWithHistories({
        assets,
        startTime: startTimeToUse,
    });

    assets = assetsWithHistories.map(asset => ({
        ...asset,
        portion: indexOverview.assets.find(a => a.id === asset.id)?.portion ?? 0,
        maxDrawDown: getMaxDrawDownWithTimeRange(asset.history),
    }));

    const index: Omit<Index<AssetWithHistoryOverviewPortionAndMaxDrawDown>, "historyOverview" | "maxDrawDown"> = {
        ...indexOverview,
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
        history: [],
    };

    const indexHistory = getIndexHistory(index);
    const indexHistoryOverview = getHistoryOverview(indexHistory);
    const indexMaxDrawDown = getMaxDrawDownWithTimeRange(indexHistory);

    return {
        ...index,
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
        startTime: startTime ?? performance.now(),
        endTime,
        history: indexHistory,
        historyOverview: indexHistoryOverview,
        maxDrawDown: indexMaxDrawDown,
    };
};
