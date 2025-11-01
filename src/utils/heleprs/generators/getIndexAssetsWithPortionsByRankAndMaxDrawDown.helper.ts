import {AssetWithMaxDrawDown, IndexOverviewAsset} from "@/utils/types/general.types";
import {MAX_PORTION} from "@/utils/constants/general.constants";
import {pick} from "lodash";
import {correctAssetPortions} from "@/utils/heleprs/generators/generators.helpers";

export function getIndexAssetsWithPortionsByRankAndMaxDrawDown(assets: AssetWithMaxDrawDown[]): IndexOverviewAsset[] {
    if (assets.length === 0) {
        return [];
    }

    // Filter out assets with zero maxDrawDown to avoid division by zero
    const validAssets = assets.filter(asset => asset.maxDrawDown.value > 0);

    if (validAssets.length === 0) {
        // If all assets have zero maxDrawDown, distribute portions equally
        const equalPortion = Math.floor(MAX_PORTION / assets.length);
        return assets.map(a => ({
            ...pick(a, ["id", "symbol", "name", "rank"]),
            portion: Math.max(equalPortion, 1),
        }));
    }

    // Calculate the inverse of maxDrawDown for each valid asset
    const totalInverseDrawDown = validAssets.reduce((sum, asset) => sum + 1 / asset.maxDrawDown.value, 0);

    // Determine the proportional portion based on the inverse of maxDrawDown
    const portionPerUnit = MAX_PORTION / totalInverseDrawDown;

    const localAssets = assets.map(a => {
        if (a.maxDrawDown.value === 0) {
            // Assign minimum portion to assets with zero maxDrawDown
            return {
                ...pick(a, ["id", "symbol", "name", "rank"]),
                portion: 1,
            };
        }

        return {
            ...pick(a, ["id", "symbol", "name", "rank"]),
            portion: Math.max(Math.round((1 / a.maxDrawDown.value) * portionPerUnit), 1),
        };
    });

    return correctAssetPortions(localAssets);
}
