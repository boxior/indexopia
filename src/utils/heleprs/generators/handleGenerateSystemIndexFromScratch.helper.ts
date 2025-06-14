import {handleGetAssetsForIndex} from "@/utils/heleprs/generators/handleGetAssetsForIndex.helper";
import {handleGenerateSystemIndex} from "@/utils/heleprs/generators/handleGenerateSystemIndex.helper";
import {CustomIndexAsset, SystemIndexBy, SystemIndexSortBy} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";

export const handleGenerateSystemIndexFromScratch = async ({
    topAssetsCount,
    upToNumber,
    systemIndexBy,
    systemIndexSortBy,
    startTime: startTimeProp,
    endTime: endTimeProp,
    equalPortions = false,
}: {
    topAssetsCount?: number;
    upToNumber?: number;
    systemIndexBy?: SystemIndexBy;
    systemIndexSortBy?: SystemIndexSortBy;
    startTime?: number;
    endTime?: number;
    equalPortions?: boolean;
}): Promise<{assets: CustomIndexAsset[]; startTime?: number; endTime?: number}> => {
    const {assets, startTime, endTime} = await handleGetAssetsForIndex({
        topAssetsCount,
        startTime: startTimeProp,
        endTime: endTimeProp,
    });

    const generatedAssets = handleGenerateSystemIndex({
        assets,
        upToNumber: upToNumber ?? topAssetsCount ?? MAX_ASSET_COUNT,
        systemIndexBy,
        systemIndexSortBy,
        equalPortions,
    });

    return {
        assets: generatedAssets,
        startTime,
        endTime,
    };
};
