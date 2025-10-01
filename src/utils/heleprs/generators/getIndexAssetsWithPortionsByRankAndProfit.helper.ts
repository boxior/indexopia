import {AssetWithProfit, IndexOverviewAsset} from "@/utils/types/general.types";
import {MAX_PORTION} from "@/utils/constants/general.constants";
import {pick} from "lodash";
import {correctAssetPortions} from "@/utils/heleprs/generators/generators.helpers";

export function getIndexAssetsWithPortionsByRankAndProfit(assets: AssetWithProfit[]): IndexOverviewAsset[] {
    if (assets.length === 0) {
        return [];
    }

    const allProfit = assets.reduce((sum, asset) => sum + asset.profit, 0);

    const profitPerPercent = allProfit / MAX_PORTION;

    const localAssets = assets.map(a => ({
        ...pick(a, ["id", "symbol", "name", "rank"]),
        portion: Math.max(Math.round(a.profit / profitPerPercent), 1),
    }));
    console.log(
        "getIndexAssetsWithPortionsByRankAndProfit localAssets",
        localAssets.reduce((a, b) => a + b.portion, 0)
    );

    return correctAssetPortions(localAssets);
}
