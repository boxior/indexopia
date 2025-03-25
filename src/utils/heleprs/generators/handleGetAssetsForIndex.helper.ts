import {getAssetHistoriesWithSmallestRange, getCachedTopAssets} from "@/app/db/db.helpers";
import {AssetWithHistory} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";

export const handleGetAssetsForIndex = async ({
    topAssetsCount = MAX_ASSET_COUNT,
    startTime,
    endTime,
}: {
    topAssetsCount?: number;
    startTime?: number;
    endTime?: number;
}): Promise<AssetWithHistory[]> => {
    const inputAssets = await getCachedTopAssets(topAssetsCount);
    const {histories} = await getAssetHistoriesWithSmallestRange({
        assetIds: inputAssets.map(a => a.id),
        startTime,
        endTime,
    });

    return inputAssets.map(a => ({...a, history: histories[a.id]}));
};
