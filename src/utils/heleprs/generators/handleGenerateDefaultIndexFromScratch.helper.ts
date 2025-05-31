import {handleGetAssetsForIndex} from "@/utils/heleprs/generators/handleGetAssetsForIndex.helper";
import {handleGenerateDefaultIndex} from "@/utils/heleprs/generators/handleGenerateDefaultIndex.helper";
import {CustomIndexAsset, DefaultIndexBy, DefaultIndexSortBy} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";

export const handleGenerateDefaultIndexFromScratch = async ({
    topAssetsCount,
    upToNumber,
    defaultIndexBy,
    defaultIndexSortBy,
    startTime: startTimeProp,
    endTime: endTimeProp,
    equalPortions = false,
}: {
    topAssetsCount?: number;
    upToNumber?: number;
    defaultIndexBy?: DefaultIndexBy;
    defaultIndexSortBy?: DefaultIndexSortBy;
    startTime?: number;
    endTime?: number;
    equalPortions?: boolean;
}): Promise<{assets: CustomIndexAsset[]; startTime?: number; endTime?: number}> => {
    const {assets, startTime, endTime} = await handleGetAssetsForIndex({
        topAssetsCount,
        startTime: startTimeProp,
        endTime: endTimeProp,
    });

    const generatedAssets = handleGenerateDefaultIndex({
        assets,
        upToNumber: upToNumber ?? topAssetsCount ?? MAX_ASSET_COUNT,
        defaultIndexBy,
        defaultIndexSortBy,
        equalPortions,
    });

    return {
        assets: generatedAssets,
        startTime,
        endTime,
    };
};
