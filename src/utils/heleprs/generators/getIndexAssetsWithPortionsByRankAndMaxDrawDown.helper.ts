import {AssetWithMaxDrawDown, IndexOverviewAsset} from "@/utils/types/general.types";
import {MAX_PORTION} from "@/utils/constants/general.constants";
import {pick} from "lodash";
import {correctAssetPortions} from "@/utils/heleprs/generators/generators.helpers";

export function getIndexAssetsWithPortionsByRankAndMaxDrawDown(assets: AssetWithMaxDrawDown[]): IndexOverviewAsset[] {
    if (assets.length === 0) {
        return [];
    }

    // Calculate the inverse of maxDrawDown for each asset
    const totalInverseDrawDown = assets.reduce((sum, asset) => sum + 1 / asset.maxDrawDown.value, 0);

    // Determine the proportional portion based on the inverse of maxDrawDown
    const portionPerUnit = MAX_PORTION / totalInverseDrawDown;

    const localAssets = assets.map(a => ({
        ...pick(a, ["id", "symbol", "name", "rank"]),
        portion: Math.max(Math.round((1 / a.maxDrawDown.value) * portionPerUnit), 1),
    }));

    return correctAssetPortions(localAssets);
}
