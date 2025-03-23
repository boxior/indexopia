import {getAssetHistoriesWithSmallestRange, getCachedTopAssets} from "@/app/db/db.helpers";
import {AssetWithHistory} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";

export const handleGetAssetsForIndex = async ({
    topAssetsCount = MAX_ASSET_COUNT,
}: {
    topAssetsCount?: number;
}): Promise<AssetWithHistory[]> => {
    const inputAssets = await getCachedTopAssets(topAssetsCount);
    const {histories} = await getAssetHistoriesWithSmallestRange(inputAssets.map(a => a.id));

    return inputAssets.map(a => ({...a, history: histories[a.id]}));
};
