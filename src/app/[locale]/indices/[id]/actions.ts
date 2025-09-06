"use server";

import {AssetWithHistoryOverviewPortionAndMaxDrawDown, Id, IndexOverview} from "@/utils/types/general.types";
import {getAssetsWithHistories, getIndexHistory, getIndexHistoryOverview} from "@/lib/db/helpers/db.helpers";
import {getMaxDrawDownWithTimeRange} from "@/utils/heleprs/generators/drawdown/sortLessDrawDownIndexAssets.helper";
import {
    dbDeleteIndexOverview,
    dbPostIndexOverview,
    dbPutIndexOverview,
} from "@/lib/db/helpers/db.indexOverview.helpers";

export const actionUpdateIndexOverview = async (indexOverview: IndexOverview) => {
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
    const historyOverview = getIndexHistoryOverview(history);
    const maxDrawDown = getMaxDrawDownWithTimeRange(history);

    return await dbPutIndexOverview({...indexOverview, historyOverview, maxDrawDown, startTime, endTime});
};

export const actionCreateIndexOverview = async ({
    name,
    startingBalance,
    assets: propAssets,
    userId,
}: Pick<IndexOverview, "name" | "assets" | "userId" | "startingBalance">) => {
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
    const historyOverview = getIndexHistoryOverview(history);
    const maxDrawDown = getMaxDrawDownWithTimeRange(history);

    return await dbPostIndexOverview({
        name,
        assets,
        historyOverview,
        maxDrawDown,
        startTime,
        endTime,
        userId,
        startingBalance,
    });
};

export const actionDeleteIndexOverview = async (id: Id) => {
    await dbDeleteIndexOverview(id);
};
