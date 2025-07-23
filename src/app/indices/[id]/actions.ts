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

    const {assets: assetsWithHistories, startTime} = await getAssetsWithHistories({
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
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
    };

    const history = await getIndexHistory(index);
    const historyOverview = await getIndexHistoryOverview(index);
    const maxDrawDown = getMaxDrawDownWithTimeRange(history);

    return await dbPutIndexOverview({...indexOverview, historyOverview, maxDrawDown, startTime});
};

export const actionCreateIndexOverview = async ({
    name,
    assets: propAssets,
    userId,
}: Pick<IndexOverview, "name" | "assets" | "userId">) => {
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
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
    };

    const history = await getIndexHistory(index);
    const historyOverview = await getIndexHistoryOverview(index);
    const maxDrawDown = getMaxDrawDownWithTimeRange(history);

    return await dbPostIndexOverview({name, assets, historyOverview, maxDrawDown, startTime, endTime, userId});
};

export const actionDeleteIndexOverview = async (id: Id) => {
    await dbDeleteIndexOverview(id);
};
