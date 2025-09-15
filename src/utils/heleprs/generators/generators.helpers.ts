import {IndexOverviewAsset} from "@/utils/types/general.types";
import {MAX_ASSET_PORTION, MAX_PORTION} from "@/utils/constants/general.constants";

/**
 * Assets portion should be strictly equal MAX_PORTION
 * @param assets
 */
export const correctAssetPortions = (assets: IndexOverviewAsset[]): IndexOverviewAsset[] => {
    const sortedNormalizedAssets = assets
        .map(a => {
            if (a.portion > MAX_ASSET_PORTION) {
                return {...a, portion: MAX_ASSET_PORTION};
            }

            if (a.portion < 1) {
                return {...a, portion: 1};
            }

            return a;
        })
        .toSorted((a, b) => b.portion - a.portion);

    const draftSumm = sortedNormalizedAssets.reduce((acc, r) => {
        return acc + r.portion;
    }, 0);

    let restSumm = draftSumm - MAX_PORTION;

    if (restSumm > 0) {
        return correctAssetPortions(
            sortedNormalizedAssets.map(r => {
                if (r.portion > 1 && restSumm > 0) {
                    restSumm -= 1;

                    return {
                        ...r,
                        portion: r.portion - 1,
                    };
                }

                return r;
            })
        );
    }

    if (restSumm < 0) {
        return correctAssetPortions(
            sortedNormalizedAssets.map(r => {
                if (r.portion < MAX_ASSET_PORTION && restSumm < 0) {
                    restSumm += 1;

                    return {
                        ...r,
                        portion: r.portion + 1,
                    };
                }

                return r;
            })
        );
    }

    return sortedNormalizedAssets;
};
