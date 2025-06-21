"use server";

import {
    AssetWithHistoryOverviewPortionAndMaxDrawDown,
    CustomIndexType,
    Id,
    IndexOverview,
} from "@/utils/types/general.types";
import {dbHandlePostCustomIndex, dbHandlePutCustomIndex} from "@/lib/db/helpers/db.index.helpers";
import {revalidateTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";
import {combineTags} from "@/utils/cache/helpers.cache";
import {getAssetsWithHistories, getIndexHistory, getIndexHistoryOverview} from "@/lib/db/helpers/db.helpers";
import {getMaxDrawDownWithTimeRange} from "@/utils/heleprs/generators/drawdown/sortLessDrawDownIndexAssets.helper";
import {
    dbDeleteIndexOverview,
    dbPostIndexOverview,
    dbPutIndexOverview,
} from "@/lib/db/helpers/db.indexOverview.helpers";
import {NextResponse} from "next/server";

export async function createCustomIndex(customIndex: Omit<CustomIndexType, "id">): Promise<CustomIndexType> {
    const {id} = await dbHandlePostCustomIndex(customIndex);

    revalidateTag(CacheTag.CUSTOM_INDEXES);
    revalidateTag(combineTags(CacheTag.INDEX, id));
    revalidateTag(combineTags(CacheTag.CUSTOM_INDEX, id));
    return {id, ...customIndex};
}

export async function updateCustomIndex(customIndex: CustomIndexType): Promise<CustomIndexType> {
    await dbHandlePutCustomIndex(customIndex);

    revalidateTag(CacheTag.CUSTOM_INDEXES);
    revalidateTag(combineTags(CacheTag.INDEX, customIndex.id));
    revalidateTag(combineTags(CacheTag.CUSTOM_INDEX, customIndex.id));
    return customIndex;
}

export const handleUpdateIndexOverview = async (indexOverview: IndexOverview) => {
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
    const historyOverview = await getIndexHistoryOverview(index.assets);
    const maxDrawDown = getMaxDrawDownWithTimeRange(history);

    return await dbPutIndexOverview({...indexOverview, historyOverview, maxDrawDown, startTime});
};

export const handleCreateIndexOverview = async ({name, assets: propAssets}: Pick<IndexOverview, "name" | "assets">) => {
    const systemId = "";

    let assets = [];

    const {assets: assetsWithHistories, startTime} = await getAssetsWithHistories({
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
    const historyOverview = await getIndexHistoryOverview(index.assets);
    const maxDrawDown = getMaxDrawDownWithTimeRange(history);

    return await dbPostIndexOverview({systemId, name, assets, historyOverview, maxDrawDown, startTime});
};

export const handleDeleteIndexOverview = async (id: Id) => {
    await dbDeleteIndexOverview(id);
};
