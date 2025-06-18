import {handleGetAssetsWithHistory} from "@/utils/heleprs/generators/handleGetAssetsForIndex.helper";
import {handleGenerateSystemIndexOverviewAssets} from "@/utils/heleprs/generators/handleGenerateSystemIndex.helper";
import {Asset, AssetHistory, IndexOverviewAsset, SystemIndexBy, SystemIndexSortBy} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";

export const handleGenerateSystemIndexOverviewAssetsWithStartEndTimes = async (
    {
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
    },
    propAssets?: Asset[],
    normalizedAssetsHistory?: Record<string, AssetHistory[]>
): Promise<{assets: IndexOverviewAsset[]; startTime?: number; endTime?: number}> => {
    const {assets, startTime, endTime} = await handleGetAssetsWithHistory({
        topAssetsCount,
        startTime: startTimeProp,
        endTime: endTimeProp,
        propAssets,
        normalizedAssetsHistory,
    });

    const generatedAssets = handleGenerateSystemIndexOverviewAssets({
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
