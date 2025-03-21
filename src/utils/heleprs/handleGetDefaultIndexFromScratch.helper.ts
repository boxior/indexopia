import {handleGetAssetsForIndex} from "@/utils/heleprs/handleGetAssetsForIndex.helper";
import {handleGenerateDefaultIndex} from "@/utils/heleprs/handleGenerateDefaultIndex.helper";
import {DefaultIndexBy} from "@/utils/types/general.types";

export const handleGetDefaultIndexFromScratch = async ({
    topAssetsCount,
    upToNumber,
    defaultIndexBy,
    startTime,
    endTime,
}: {
    topAssetsCount?: number;
    upToNumber: number;
    defaultIndexBy?: DefaultIndexBy;
    startTime?: number | string | Date;
    endTime?: number | string | Date;
}) => {
    const assets = await handleGetAssetsForIndex({topAssetsCount});

    return handleGenerateDefaultIndex({assets, upToNumber, defaultIndexBy, startTime, endTime});
};
