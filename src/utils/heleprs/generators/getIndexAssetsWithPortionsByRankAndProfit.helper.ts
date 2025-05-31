import {AssetWithProfit, CustomIndexAsset} from "@/utils/types/general.types";
import {MAX_PORTION} from "@/app/indexes/components/CustomIndex/CustomIndexAssetsPortions";
import {correctAssetPortions} from "@/utils/heleprs/generators/generators.helpers";

export function getIndexAssetsWithPortionsByRankAndProfit(assets: AssetWithProfit[]): CustomIndexAsset[] {
    if (assets.length === 0) {
        return [];
    }

    const allProfit = assets.reduce((sum, asset) => sum + asset.profit, 0);

    const profitPerPercent = allProfit / MAX_PORTION;

    return correctAssetPortions(
        assets.map(a => ({id: a.id, portion: Math.max(Math.round(a.profit / profitPerPercent), 1)}))
    );
}
