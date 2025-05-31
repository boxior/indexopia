import {AssetWithMaxDrawDown, CustomIndexAsset} from "@/utils/types/general.types";
import {MAX_PORTION} from "@/app/indexes/components/CustomIndex/CustomIndexAssetsPortions";
import {correctAssetPortions} from "@/utils/heleprs/generators/generators.helpers";

export function getIndexAssetsWithPortionsByRankAndMaxDrawDown(assets: AssetWithMaxDrawDown[]): CustomIndexAsset[] {
    if (assets.length === 0) {
        return [];
    }

    // Calculate the inverse of maxDrawDown for each asset
    const totalInverseDrawDown = assets.reduce((sum, asset) => sum + 1 / asset.maxDrawDown.value, 0);

    // Determine the proportional portion based on the inverse of maxDrawDown
    const portionPerUnit = MAX_PORTION / totalInverseDrawDown;

    return correctAssetPortions(
        assets.map(a => ({
            id: a.id,
            portion: Math.max(Math.round((1 / a.maxDrawDown.value) * portionPerUnit), 1),
        }))
    );
}
