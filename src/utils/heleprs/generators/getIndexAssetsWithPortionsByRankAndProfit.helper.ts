import {AssetWithProfit, CustomIndexAsset, IndexOverviewAsset} from "@/utils/types/general.types";
import {MAX_PORTION} from "@/app/indexes/components/CustomIndex/CustomIndexAssetsPortions";
import {correctAssetPortions} from "@/utils/heleprs/generators/generators.helpers";
import {pick} from "lodash";

export function getIndexAssetsWithPortionsByRankAndProfit(assets: AssetWithProfit[]): IndexOverviewAsset[] {
    if (assets.length === 0) {
        return [];
    }

    const allProfit = assets.reduce((sum, asset) => sum + asset.profit, 0);

    const profitPerPercent = allProfit / MAX_PORTION;

    return correctAssetPortions(
        assets.map(a => ({
            ...pick(a, ["id", "symbol", "name", "rank"]),
            portion: Math.max(Math.round(a.profit / profitPerPercent), 1),
        }))
    );
}
