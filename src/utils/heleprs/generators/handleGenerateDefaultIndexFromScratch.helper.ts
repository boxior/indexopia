import {handleGetAssetsForIndex} from "@/utils/heleprs/generators/handleGetAssetsForIndex.helper";
import {handleGetCustomIndexAssets} from "@/utils/heleprs/generators/handleGenerateDefaultIndex.helper";
import {CustomIndexAsset, DefaultIndexBy, DefaultIndexSortBy} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";

export const handleGenerateDefaultIndexFromScratch = async ({
    topAssetsCount,
    upToNumber,
    defaultIndexBy,
    defaultIndexSortBy,
    startTime: startTimeProp,
    endTime: endTimeProp,
}: {
    topAssetsCount?: number;
    upToNumber?: number;
    defaultIndexBy?: DefaultIndexBy;
    defaultIndexSortBy?: DefaultIndexSortBy;
    startTime?: number;
    endTime?: number;
}): Promise<{assets: CustomIndexAsset[]; startTime?: number; endTime?: number}> => {
    const {assets, startTime, endTime} = await handleGetAssetsForIndex({
        topAssetsCount,
        startTime: startTimeProp,
        endTime: endTimeProp,
    });

    return {
        assets: handleGetCustomIndexAssets({
            assets,
            upToNumber: upToNumber ?? topAssetsCount ?? MAX_ASSET_COUNT,
            defaultIndexBy,
            defaultIndexSortBy,
        }),
        startTime,
        endTime,
    };
};
