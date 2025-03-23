import {fetchAssetHistoriesWithSmallestRange, getCachedTopAssets} from "@/app/db/db.helpers";
import {AssetWithHistory} from "@/utils/types/general.types";

export const handleGetAssetsForIndex = async ({
    topAssetsCount = 50,
}: {
    topAssetsCount?: number;
}): Promise<AssetWithHistory[]> => {
    const inputAssets = await getCachedTopAssets(topAssetsCount);
    const {histories} = await fetchAssetHistoriesWithSmallestRange(inputAssets.map(a => a.id));

    return inputAssets.map(a => ({...a, history: histories[a.id]}));
};
