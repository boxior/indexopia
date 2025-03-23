import {handleGetAssetsForIndex} from "@/utils/heleprs/generators/handleGetAssetsForIndex.helper";
import {handleGenerateDefaultIndex} from "@/utils/heleprs/generators/handleGenerateDefaultIndex.helper";
import {DefaultIndexBy} from "@/utils/types/general.types";

export const handleGenerateDefaultIndexFromScratch = async ({
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
