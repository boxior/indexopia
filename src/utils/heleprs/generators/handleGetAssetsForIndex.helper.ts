import {getAssetHistoriesWithSmallestRange, getCachedTopAssets} from "@/lib/db/helpers/db.helpers";
import {Asset, AssetHistory, AssetWithHistory} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";

export const handleGetAssetsWithHistory = async ({
    topAssetsCount = MAX_ASSET_COUNT,
    startTime: startTimeProp,
    endTime: endTimeProp,
    propAssets,
    normalizedAssetsHistory,
}: {
    topAssetsCount?: number;
    startTime?: number;
    endTime?: number;
    propAssets?: Asset[];
    normalizedAssetsHistory?: Record<string, AssetHistory[]>;
}): Promise<{assets: AssetWithHistory[]; startTime?: number; endTime?: number}> => {
    const inputAssets = propAssets ?? (await getCachedTopAssets(topAssetsCount));

    const {histories, startTime, endTime} = await getAssetHistoriesWithSmallestRange({
        assetIds: inputAssets.map(a => a.id),
        startTime: startTimeProp,
        endTime: endTimeProp,
        normalizedAssetsHistory,
    });

    return {
        assets: inputAssets.map(a => ({...a, history: histories[a.id]})),
        startTime,
        endTime,
    };
};
