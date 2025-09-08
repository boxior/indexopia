import {IndexOverviewAsset} from "@/utils/types/general.types";
import {MAX_ASSET_PORTION, MAX_PORTION} from "@/utils/constants/general.constants";

/**
 * Assets portion should be strictly equal MAX_PORTION
 * @param assets
 */
export const correctAssetPortions = (assets: IndexOverviewAsset[]): IndexOverviewAsset[] => {
    const draftSumm = assets.reduce((acc, r) => {
        return acc + r.portion;
    }, 0);

    let restSumm = draftSumm - MAX_PORTION;

    const sortedFilteredAssets = assets.toSorted((a, b) => b.portion - a.portion).filter(r => r.portion > 0);

    if (restSumm > 0) {
        return correctAssetPortions(
            sortedFilteredAssets.map(r => {
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
            sortedFilteredAssets.map(r => {
                if (r.portion > 1 && r.portion < MAX_ASSET_PORTION && restSumm < 0) {
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

    if (restSumm === 0 && sortedFilteredAssets.some(p => p.portion < 1)) {
        return correctAssetPortions(
            sortedFilteredAssets.map(r => {
                if (r.portion < 1 && restSumm === 0) {
                    return {
                        ...r,
                        portion: 1,
                    };
                }

                return r;
            })
        );
    }

    return sortedFilteredAssets;
};
