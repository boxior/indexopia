import {handleGetAssetsForIndex} from "@/utils/heleprs/generators/handleGetAssetsForIndex.helper";
import {handleGenerateDefaultIndex} from "@/utils/heleprs/generators/handleGenerateDefaultIndex.helper";
import {CustomIndexAsset, DefaultIndexBy, DefaultIndexSortBy} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";

export const handleGenerateDefaultIndexFromScratch = async ({
    topAssetsCount,
    upToNumber,
    defaultIndexBy,
    defaultIndexSortBy,
    startTime,
    endTime,
}: {
    topAssetsCount?: number;
    upToNumber?: number;
    defaultIndexBy?: DefaultIndexBy;
    defaultIndexSortBy?: DefaultIndexSortBy;
    startTime?: number | string | Date;
    endTime?: number | string | Date;
}): Promise<CustomIndexAsset[]> => {
    const assets = await handleGetAssetsForIndex({topAssetsCount});

    return handleGenerateDefaultIndex({
        assets,
        upToNumber: upToNumber ?? topAssetsCount ?? MAX_ASSET_COUNT,
        defaultIndexBy,
        defaultIndexSortBy,
        startTime,
        endTime,
    });
};
