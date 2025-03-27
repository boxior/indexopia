import {getAssetHistoriesWithSmallestRange, getCachedTopAssets} from "@/app/db/db.helpers";
import {AssetWithHistory} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";

export const handleGetAssetsForIndex = async ({
    topAssetsCount = MAX_ASSET_COUNT,
    startTime: startTimeProp,
    endTime: endTimeProp,
}: {
    topAssetsCount?: number;
    startTime?: number;
    endTime?: number;
}): Promise<{assets: AssetWithHistory[]; startTime?: number; endTime?: number}> => {
    const inputAssets = await getCachedTopAssets(topAssetsCount);

    const {histories, startTime, endTime} = await getAssetHistoriesWithSmallestRange({
        assetIds: inputAssets.map(a => a.id),
        startTime: startTimeProp,
        endTime: endTimeProp,
    });

    return {
        assets: inputAssets.map(a => ({...a, history: histories[a.id]})),
        startTime,
        endTime,
    };
};
